<?php

namespace App\Services\Dining;

/**
 * Bangladeshi mobile numbers reach us in several shapes -- "01712345678",
 * "+8801712345678", "8801712345678", sometimes with spaces or dashes. Members
 * were enrolled from a roster with no format guarantee, so login has to match
 * across all of them rather than assume one.
 */
class PhoneNumberService
{
    /**
     * Canonical form used for storage and display: local, 11 digits, "01XXXXXXXXX".
     */
    public function normalize(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);

        if ($digits === '') {
            return null;
        }

        // Strip the country code in either of its written forms.
        if (str_starts_with($digits, '880')) {
            $digits = substr($digits, 3);
        }

        // A number keyed without its leading zero.
        if (strlen($digits) === 10 && str_starts_with($digits, '1')) {
            $digits = '0' . $digits;
        }

        return $digits;
    }

    /**
     * Every spelling of a number that might appear in the members table, so a
     * lookup can use whereIn instead of guessing which one was stored.
     *
     * @return string[]
     */
    public function variants(?string $phone): array
    {
        $local = $this->normalize($phone);

        if ($local === null) {
            return [];
        }

        $bare = ltrim($local, '0');

        return array_values(array_unique([
            $local,
            $bare,
            '88' . $local,
            '+88' . $local,
            '880' . $bare,
            '+880' . $bare,
        ]));
    }

    /**
     * A valid BD mobile number: 11 digits, "01", then an operator prefix 3-9.
     */
    public function isValid(?string $phone): bool
    {
        $local = $this->normalize($phone);

        return $local !== null && preg_match('/^01[3-9]\d{8}$/', $local) === 1;
    }

    /**
     * Partly hidden for display back to the user ("017••••678"), confirming we
     * have the right number without printing it in full.
     */
    public function mask(?string $phone): ?string
    {
        $local = $this->normalize($phone);

        if ($local === null || strlen($local) < 7) {
            return $local;
        }

        return substr($local, 0, 3) . str_repeat('•', 4) . substr($local, -3);
    }
}
