<?php

namespace App\Repositories;

use App\Models\CodeSequence;
use App\Services\ODataService;

class CodeSequenceRepository extends BaseRepository
{
    /**
     * @var CodeSequence
     */
    protected $model;

    protected $request;

    protected $oDataService;

    protected $fieldSearchable = ['label', 'prefix', 'separator', 'next_sequence'];

    public function __construct()
    {
        $this->model         = new CodeSequence();
    }
    protected function init()
    {
        $this->request      = request();
        $this->oDataService = (new ODataService())->init();
    }

    public function getLatestCodeByLabel($label)
    {
        $codeSequenceInfo = $this->newQuery()
            ->where('label', $label)
            ->first();

        $nextCodeSequence = null;
        if (!empty($codeSequenceInfo)) {
            $autoIncrementNumber = intval($codeSequenceInfo->next_sequence);
            $nextCodeSequence = "{$codeSequenceInfo->prefix}{$codeSequenceInfo->separator}{$autoIncrementNumber}";
        }
        return $nextCodeSequence;
    }

    public function updateNextSequenceByLabel($label)
    {
        $codeSequenceInfo = $this->newQuery()
            ->where('label', $label)
            ->first();

        if (!empty($codeSequenceInfo)) {
            $codeSequenceInfo->next_sequence = intval($codeSequenceInfo->next_sequence) + 1;
            $codeSequenceInfo->save();
        }
    }
}
