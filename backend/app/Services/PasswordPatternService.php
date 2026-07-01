<?php

namespace App\Services;

class PasswordPatternService {
        /**
     * @return array Password policy
     */
    public static function passwordPolicyMaker()
    {
        $pass_length        = 6;
        $pass_is_upper      = false;
        $pass_is_lower      = false;
        $pass_is_number     = false;
        $pass_special_char  = false;

        $pass_length        = empty($pass_length) ? 6 : (int) $pass_length;

        if ($pass_length) {
            $length = '(?=^.{' . $pass_length . ',}$)';
            $_pattern = $length;
            $_message = 'Minimum length should be '. $pass_length. ' characters' ;
        }

        $_message .= ' and there should be a combination of ';

        if ($pass_is_number === true) {
            $number = '(?=.*[0-9])';
            $_pattern .= $number;
            $_message .= 'number (0-9), ';
        }

        if ($pass_special_char === true) {
            $special_character = '(?=.*[@$!%*?&])';
            $_pattern .= $special_character;
            $_message .= 'special character (e.g. *#@$%&!), ';
        }

        if ($pass_is_upper === true) {
            $uppercase = '(?=.*[A-Z])';
            $_pattern .= $uppercase;
            $_message .= 'uppercase (A-Z), ';
        }

        if ($pass_is_lower === true) {
            $lowercase = '(?=.*[a-z])';
            $_pattern .= $lowercase;
            $_message .= 'lowercase (a-z), ';
        }

        $_pattern .= '.*$';
        $_message = rtrim($_message, ', ');
        $_message .= '';

        return array(
            'pattern' => $_pattern,
            'patterns' => array(
                'length' => $length ?? null,
                'number' => $number ?? null,
                'uppercase' => $uppercase ?? null,
                'lowercase' => $lowercase ?? null,
                'special_character' => $special_character ?? null,
                'message' => $_message ?? null,
            )
        );
    }
}
