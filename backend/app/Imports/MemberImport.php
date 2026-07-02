<?php

namespace App\Imports;

use Illuminate\Support\Str;
use App\Repositories\Dining\MemberRepository;
use App\Repositories\DepartmentRepository;
use App\Repositories\DesignationRepository;
use App\Repositories\CodeSequenceRepository;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class MemberImport implements ToModel, WithValidation, WithChunkReading, WithHeadingRow
{
    use Importable;

    protected $memberRepository;
    protected $departmentRepository;
    protected $designationRepository;

    public $importedCount = 0;
    public $skippedRows = [];

    public function __construct()
    {
        $this->memberRepository = new MemberRepository();
        $this->departmentRepository = new DepartmentRepository();
        $this->designationRepository = new DesignationRepository();
    }

    /**
     * Expected columns (header row): member_type, name, phone, email,
     * rfid_card_number, department, designation, class_name, section, roll_no
     *
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        $memberType = Str::upper(Str::squish($row['member_type'] ?? ''));
        $name = Str::squish($row['name'] ?? '');

        if (empty($name) || !in_array($memberType, ['STAFF', 'STUDENT'])) {
            $this->skippedRows[] = ($row['name'] ?? '(no name)') . ': invalid or missing name/member_type';
            return null;
        }

        $rfidCardNumber = !empty($row['rfid_card_number']) ? Str::squish((string) $row['rfid_card_number']) : null;
        if ($rfidCardNumber && $this->memberRepository->findByRfidCardNumber($rfidCardNumber)) {
            $this->skippedRows[] = "{$name}: RFID card {$rfidCardNumber} already assigned to another member";
            return null;
        }

        $departmentId = null;
        $designationId = null;
        if ($memberType === 'STAFF') {
            if (!empty($row['department'])) {
                $department = $this->departmentRepository->findBy('name', Str::squish($row['department']));
                if (!$department) {
                    $this->skippedRows[] = "{$name}: department '{$row['department']}' not found";
                    return null;
                }
                $departmentId = $department->id;
            } else {
                $this->skippedRows[] = "{$name}: department is required for staff";
                return null;
            }

            if (!empty($row['designation'])) {
                $designation = $this->designationRepository->findBy('name', Str::squish($row['designation']));
                $designationId = $designation ? $designation->id : null;
            }
        }

        if ($memberType === 'STUDENT' && (empty($row['class_name']) || empty($row['roll_no']))) {
            $this->skippedRows[] = "{$name}: class_name and roll_no are required for students";
            return null;
        }

        $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('MEMBER');
        if ($latestCodeSequence == null) {
            Log::error('Code Sequence not found for MEMBER during import!');
            return null;
        }

        $member = $this->memberRepository->create([
            'member_code'      => $latestCodeSequence,
            'rfid_card_number' => $rfidCardNumber,
            'member_type'      => $memberType,
            'name'             => $name,
            'phone'            => $row['phone'] ?? null,
            'email'            => $row['email'] ?? null,
            'department_id'    => $departmentId,
            'designation_id'   => $designationId,
            'class_name'       => $row['class_name'] ?? null,
            'section'          => $row['section'] ?? null,
            'roll_no'          => $row['roll_no'] ?? null,
        ]);

        (new CodeSequenceRepository())->updateNextSequenceByLabel('MEMBER');
        $this->importedCount++;

        return $member;
    }

    public function rules(): array
    {
        return [];
    }

    public function chunkSize(): int
    {
        return 50;
    }
}
