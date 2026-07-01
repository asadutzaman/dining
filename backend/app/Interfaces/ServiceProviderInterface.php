<?php

namespace App\Interfaces;


use Pimple\Container;

/**
 * Interface ServiceProviderInterface
 * @package App\Interfaces
 */
interface ServiceProviderInterface
{
    /**
     * @param Container $pimple
     * @return mixed
     */
    public function register(Container $pimple);

}