<?php

namespace App\Services;

use App\Exceptions\DebugException;

class DebugService
{
    public static function getSqlWithBindings($query)
    {
        $sql = $query->toSql();
        $bindings = $query->getBindings();

        $needle = '?';
        foreach ($bindings as $replace) {
            $pos = strpos($sql, $needle);
            if ($pos !== false) {
                if (gettype($replace) === "string") {
                    $replace = ' "' . addslashes($replace) . '" ';
                }
                $sql = substr_replace($sql, $replace, $pos, strlen($needle));
            }
        }
        return $sql;
    }

    public static function getSqlWithBindingsAndDie($query)
    {
      echo self::getSqlWithBindings($query);
      exit();
    }

    public static function dump($var, $detail = false) {
        if (is_array($var)) {
            if ($detail == false) {
                echo "<pre>";
                print_r($var);
                echo "</pre>";
            } else {
                echo "<pre>";
                var_dump($var);
                echo "</pre>";
            }
        }
        else {
            if ($detail == false) {
                echo "<pre>";
                echo $var;
                echo "</pre>";
            } else {
                echo "<pre>";
                var_dump($var);
                echo "</pre>";
            }
        }
    }

    public static function dumpdie($var, $detail = false) {
        $debug_backtrace = debug_backtrace(1);
        $caller = array_shift($debug_backtrace);
        self::dump($var, $detail);
        die();
    }

    public static function debugException($var) {
        throw new DebugException($var);
    }

    protected static function getPhpInfo()
    {
        ob_start();
        phpinfo();

        return ob_get_clean();
    }

}
