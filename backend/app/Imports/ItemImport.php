<?php

namespace App\Imports;

use Illuminate\Support\Str;
use App\Repositories\ItemRepository;
use App\Repositories\LogisticRepository;
use App\Repositories\ItemCategoryRepository;
use App\Repositories\BrandRepository;
use App\Repositories\CodeSequenceRepository;
use App\Repositories\UnitRepository;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithCalculatedFormulas;

class ItemImport implements ToModel, WithValidation, WithChunkReading, WithHeadingRow, WithCalculatedFormulas
{
    use Importable;

    protected $itemRepository;
    protected $logisticRepository;
    protected $itemCategoryRepository;
    protected $brandRepository;
    protected $unitRepository;


    public function __construct()
    {
        $this->itemRepository = new ItemRepository();
        $this->logisticRepository = new LogisticRepository();
        $this->itemCategoryRepository = new ItemCategoryRepository();
        $this->brandRepository = new BrandRepository();
        $this->unitRepository = new UnitRepository();
    }
    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // [EXTRA : FOR EMPTY ROWS - WHERE ALL FIELDS' DATA IS ENDED]
        // if (
        //     empty($row['logistic']) ||
        //     empty($row['item_category']) ||
        //     empty($row['brand']) ||
        //     empty($row['unit'])
        // ) {
        //     return null;
        // }

        // LOGISTIC
        $logisticName = Str::squish($row['logistic']);
        // Logistic-1 split by - and first three letter & get the last part
        $logisticCode = Str::upper(Str::substr(Str::before($logisticName, '-'), 0, 3)) . Str::after($logisticName, '-');
        $logisticInfo = $this->logisticRepository->findBy('code', $logisticCode);
        if ($logisticInfo) {
            $logisticId = $logisticInfo->id;
        } else {
            $logisticResponse = $this->logisticRepository->create([
                'name' => $logisticName,
                'code' => $logisticCode
            ]);
            $logisticId = $logisticResponse->id;
        }

        // ITEM CATEGORY
        $itemCategoryCode = Str::lower(Str::replace(' ', '', Str::squish($row['item_category'])));
        $itemCategoryInfo = $this->itemCategoryRepository->findBy('code', $itemCategoryCode);
        if ($itemCategoryInfo) {
            $itemCategoryId = $itemCategoryInfo->id;
        } else {
            $itemCategoryData = [
                'name' => Str::squish($row['item_category']),
                'code' => $itemCategoryCode
            ];
            $itemCategoryResponse = $this->itemCategoryRepository->create($itemCategoryData);
            $itemCategoryId = $itemCategoryResponse->id;
        }

        // BRAND
        $brandInfo = $this->brandRepository->findBy('name', Str::squish($row['brand']));
        if ($brandInfo) {
            $brandId = $brandInfo->id;
        } else {
            $brandData = [
                'name'       => Str::squish($row['brand']),
            ];
            $brandResponse = $this->brandRepository->create($brandData);
            $brandId = $brandResponse->id;
        }

        // UNIT
        $unitShortName = Str::lower(Str::replace(' ', '', Str::squish($row['base_unit'])));
        $unitInfo = $this->unitRepository->findBy('short_name', $unitShortName);
        if ($unitInfo) {
            $unitId = $unitInfo->id;
        } else {
            $unitData = [
                'name'       => Str::squish($row['base_unit']),
                'short_name' => $unitShortName,
            ];
            $unitResponse = $this->unitRepository->create($unitData);
            $unitId = $unitResponse->id;
        }

        // LOGISTIC - ITEM CATEGORY - BRAND - UNIT
        $duplicateExist = $this->itemRepository->checkItemUnique($logisticId, $itemCategoryId, $brandId, $unitId, Str::squish($row['item_name_en']));
        // ++$this->rowCount;

        if ($duplicateExist == 0) {
            $latestCodeSequence = (new CodeSequenceRepository())->getLatestCodeByLabel('ITEM');
            if ($latestCodeSequence == null) {
                Log::error("Code Sequence not found!");
            }
            // CHECK DUPLICATE ITEM CODE
            $checkDuplicateItemCode = $this->itemRepository->checkItemCodeUnique($latestCodeSequence);
            if ($checkDuplicateItemCode > 0) {
                Log::error("{$latestCodeSequence} - This Code Sequence is already exist!");
            }

            // CHECK DUPLICATE NAME CODE
            // $checkDuplicateNameCode = $this->itemRepository->checkItemNameCodeUnique(Str::squish($row['item_name_en']));
            // if ($checkDuplicateNameCode > 0) {
            //     Log::error("{$row['item_name_en']} - This Name is already exist!");
            // }

            // $itemCode = $this->itemRepository->getItemCodeByLogistic($logisticId);

            $this->itemRepository->create([
                'name_en'               => $row['item_name_en'],
                'name_bn'               => $row['item_name_bn'],
                'code'                  => $latestCodeSequence,
                'type'                  => $row['type'],
                'logistic_id'           => $logisticId,
                'item_category_id'      => $itemCategoryId,
                'brand_id'              => $brandId,
                'base_unit_id'          => $unitId,
                'reorder_qty'           => $row['reorder_qty'],
            ]);

            // UPDATE CODE SEQUENCE
            return (new CodeSequenceRepository())->updateNextSequenceByLabel('ITEM');
        }
    }

    public function rules(): array
    {
        return [];
    }

    public function chunkSize(): int
    {
        return 10;
    }

    /**
     * @return array
     */
    public function customValidationAttributes()
    {
        return [
            // 'type' => 'BOQ Part/Type',
        ];
    }
}
