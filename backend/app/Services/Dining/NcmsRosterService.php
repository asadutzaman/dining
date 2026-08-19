<?php

namespace App\Services\Dining;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

/**
 * Reads the staff/student roster from NCMS.
 *
 * NCMS returns *everyone* (~1000 staff + students) with no dining flag, so this service
 * only fetches and normalizes. Deciding who is an actual dining member is this app's job
 * and happens in the members table -- see MemberRepository::enrollFromCandidate().
 *
 * Not built on HttpClientService: that one forwards the caller's inbound Authorization
 * header to the outbound host, which would hand our JWT to the NCMS server.
 */
class NcmsRosterService
{
    /**
     * @return array raw rows as returned by NCMS
     */
    public function fetchUsers(): array
    {
        $url = rtrim((string) config('api.ncms.url'), '/') . '/' . ltrim((string) config('api.ncms.users_endpoint'), '/');

        $response = Http::timeout((int) config('api.ncms.timeout', 60))
            ->acceptJson()
            ->get($url);

        if (!$response->successful()) {
            throw new \Exception("NCMS roster request failed ({$response->status()}): {$url}");
        }

        $body = $response->json();

        // Tolerate both a bare array and the common {data: [...]} envelope.
        $rows = Arr::get($body, 'data', $body);

        if (!is_array($rows)) {
            throw new \Exception('NCMS roster response was not a list of users.');
        }

        return $rows;
    }

    /**
     * Map one NCMS row onto member_candidates columns.
     *
     * Returns null when the row cannot be keyed (no usable external id), so the caller
     * can count it as skipped rather than writing an unaddressable row.
     */
    public function normalize($row): ?array
    {
        $row = (array) $row;

        $type = strtolower(trim((string) Arr::get($row, 'type')));
        if (!in_array($type, ['staff', 'student'], true)) {
            return null;
        }

        $staffId = $this->cleanString(Arr::get($row, 'staff_id'));

        // Students: the exact id field is unconfirmed (the sample payload we have is all
        // staff), so accept the plausible spellings rather than guessing one.
        $rollNo = $this->cleanString(
            Arr::get($row, 'roll_no')
                ?? Arr::get($row, 'roll')
                ?? Arr::get($row, 'student_id')
                ?? Arr::get($row, 'id')
        );

        $externalId = $type === 'staff' ? $staffId : $rollNo;
        if (empty($externalId)) {
            return null;
        }

        $name = $this->cleanString(Arr::get($row, 'name'));
        if (empty($name)) {
            return null;
        }

        return [
            'type'        => $type,
            'external_id' => $externalId,
            'name'        => $name,
            'staff_id'    => $staffId,
            'roll_no'     => $rollNo,
            // NCMS sends "" for anyone without a card. Store NULL so "has no card" is a
            // single representable state and the rfid lookups can't match on emptiness.
            'rfid'        => $this->cleanString(Arr::get($row, 'rfid')),
            'image_url'   => $this->absoluteImageUrl(Arr::get($row, 'image')),
        ];
    }

    private function cleanString($value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = Str::squish((string) $value);

        return $value === '' ? null : $value;
    }

    private function absoluteImageUrl($image): ?string
    {
        $image = $this->cleanString($image);
        if ($image === null) {
            return null;
        }

        if (Str::startsWith($image, ['http://', 'https://'])) {
            return $image;
        }

        return rtrim((string) config('api.ncms.image_base_url'), '/') . '/' . ltrim($image, '/');
    }
}
