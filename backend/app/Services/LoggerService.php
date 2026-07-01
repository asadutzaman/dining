<?php

namespace App\Services;

use Monolog\Logger;
use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;

class LoggerService
{
    protected static $inst = null;
    private $dateFormat = 'Y-m-d H:i:s';
    protected $logger;
    private $fileName = '';
    private $filePath = '';
    private $outputFormat = "[%datetime%]  %channel%.%level_name% : %message%\n";
    private $enable = true;
    private $saveToDatabase = false;

    protected $levels = [
        'debug'     => Logger::DEBUG,
        'info'      => Logger::INFO,
        'notice'    => Logger::NOTICE,
        'warning'   => Logger::WARNING,
        'error'     => Logger::ERROR,
        'critical'  => Logger::CRITICAL,
        'alert'     => Logger::ALERT,
        'emergency' => Logger::EMERGENCY,
    ];

    public static function Instance()
    {
        if(!isset(self::$inst)){
            self::$inst = new LoggerService();
        }
        return self::$inst;
    }

    function __construct()
    {
        $this->logger = new Logger($this->fileName);

        $this->path = $this->generatePath($this->filePath, $this->fileName);

        $formatter = new LineFormatter($this->outputFormat, $this->dateFormat, true, true);
        $stream    = new StreamHandler($this->path, Logger::DEBUG);

        $stream->setFormatter($formatter);

        $this->logger->pushHandler($stream);
    }

    private function write(string $type, string $message, array $extra_data = []): ?bool
    {
        if (!$this->enable) {
            return false;
        }

        if (!in_array($type, array_keys($this->levels))) {
            return false;
        }

        return $extra_data ? $this->logger->$type($message, $extra_data) : $this->logger->$type($message);
    }

    public function debug(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        return $this->write('debug', $message, $extra_data);
    }

    public function info(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        return $this->write('info', $message, $extra_data);
    }

    public function notice(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        return $this->write('notice', $message, $extra_data);
    }

    public function warning(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        if ($this->saveToDatabase && $save_to_database) {
            /*Log::create([
                'type'        => 'WARNING',
                'message'     => $message,
                'code'        => $extra_data['code'] ?? null,
                'line'        => $extra_data['line'] ?? null,
                'stack_trace' => $extra_data['stack_trace'] ?? null,
                'extra_data'  => json_encode($extra_data)
            ]);*/
        }

        return $this->write('warning', $message, $extra_data);
    }

    public function error(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        if ($this->saveToDatabase && $save_to_database) {
           /* Log::create([
                'type'        => 'ERROR',
                'message'     => $message,
                'code'        => $extra_data['code'] ?? null,
                'line'        => $extra_data['line'] ?? null,
                'stack_trace' => $extra_data['stack_trace'] ?? null,
                'extra_data'  => json_encode($extra_data)
            ]);*/
        }

        return $this->write('error', $message, $extra_data);

    }

    public function critical(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        if ($this->saveToDatabase && $save_to_database) {
           /* Log::create([
                'type'        => 'CRITICAL',
                'message'     => $message,
                'code'        => $extra_data['code'] ?? null,
                'line'        => $extra_data['line'] ?? null,
                'stack_trace' => $extra_data['stack_trace'] ?? null,
                'extra_data'  => json_encode($extra_data)
            ]);*/
        }

        return $this->write('critical', $message, $extra_data);
    }

    public function alert(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        return $this->write('alert', $message, $extra_data);
    }

    public function emergency(string $message, array $extra_data = [], bool $save_to_database = true): ?bool
    {
        if ($this->saveToDatabase && $save_to_database) {
            /*Log::create([
                'type'        => 'EMERGENCY',
                'message'     => $message,
                'code'        => $extra_data['code'] ?? null,
                'line'        => $extra_data['line'] ?? null,
                'stack_trace' => $extra_data['stack_trace'] ?? null,
                'extra_data'  => json_encode($extra_data)
            ]);*/
        }

        return $this->write('emergency', $message, $extra_data);
    }

    public function logException(string $log_level, \Exception $exception)
    {
        $log_level = strtolower(trim($log_level));

        $message = "\n" . $exception->getFile() . "\n";
        $message .= "LINE: " . $exception->getLine() . "\n";
        $message .= "CODE: " . $exception->getCode() . " - " . $exception->getMessage() . "\n";
        $message .= "================================================\n";
        $message .= $exception->getTraceAsString() . "\n\n";

        // Save to database
        if ($this->saveToDatabase) {
            /*Log::create([
                'message' => $exception->getMessage(),
                'line' => $exception->getLine(),
                'code' => $exception->getCode(),
                'file' => $exception->getFile(),
                'stack_trace' => $exception->getTraceAsString(),
                'type' => 'ERROR'
            ]);*/
        }

        if(method_exists($this->logger, $log_level))
            $this->{$log_level}($message, [
                'code' => $exception->getCode(),
                'line' => $exception->getLine(),
                'file' => $exception->getFile(),
                'stack_trace' => $exception->getTraceAsString()
            ], false);
    }

    private function generatePath($path, $name)
    {
        $fileName = $name ? $name.'_'.date('Ymd').'.log' : date('Ymd').'.log';
        $filePath = $path ? 'logs/'.$path.DIRECTORY_SEPARATOR.$fileName : $fileName;

        return storage_path($filePath);
    }
}
