<?php

namespace App\Http\Controllers;

use App\Exceptions\ValidatorException;
use App\Http\Resources\OrganogramResource;
use App\Repositories\OrganogramRepository;
// use App\Repositories\OrganogramSanctionPostRepository;
use App\Services\DoptarRestApiService;
use App\Services\ResourceService;
use App\Traits\Controller\RestControllerTrait;
use App\Validators\OrganogramValidator;
use Dotenv\Exception\ValidationException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganogramController extends Controller
{
    private $repository;

    // private $organogramSanctionPostRepository;

    private $validator;

    private $resource;

    private $partialUpdateFields = ['status'];

    use RestControllerTrait;

    public function __construct(
        OrganogramRepository $repository,
        // OrganogramSanctionPostRepository $organogramSanctionPostRepository,
        OrganogramValidator $validator
    ) {
        $this->repository = $repository;
        // $this->organogramSanctionPostRepository = $organogramSanctionPostRepository;
        $this->validator = $validator;
        $this->resource = OrganogramResource::class;
    }


    // public function store(Request $request)
    // {
    //     try {
    //         $items = $request->all();
    //         $organogramData = !empty($items['organogramData']) ? $items['organogramData'] : null;
    //         $organogramSanctionPostData = !empty($items['organogramSacntionPostListData']) ? $items['organogramSacntionPostListData'] : null;


    //         $organogramDataResult = $this->repository->create($organogramData);
    //         if (empty($organogramDataResult)) {
    //             throw new Exception("Organogram save fail!");
    //         }

    //           // ORganogram Sanction Post
    //           if ($organogramSanctionPostData) {
    //             $organogramSanctionPostIds = array_column($organogramSanctionPostData, 'id');
    //             $this->organogramSanctionPostRepository->deleteOrganogramSanctionPostIds($organogramDataResult["id"], $organogramSanctionPostIds);
    //             foreach ($organogramSanctionPostData as $item) {
    //                 $organogramSanctionPostData = $item;
    //                 $organogramSanctionPostData['organogram_id'] = $organogramDataResult["id"];
    //                 if (!empty($item['id'])) {
    //                     $organogramSanctionPostDataResult = $this->organogramSanctionPostRepository->update($organogramSanctionPostData, $item['id']);
    //                 } else {
    //                     $organogramSanctionPostDataResult = $this->organogramSanctionPostRepository->create($organogramSanctionPostData);
    //                 }
    //             }
    //         }



    //         DB::commit();
    //         $response = $this->repository->show($organogramDataResult["id"]);
    //         return $this->successResponse($response);

    //     }
    //     catch (ValidationException $e) {
    //         DB::rollBack();
    //         throw new ValidatorException($e);
    //     }
    //     catch (\Exception $e) {
    //         DB::rollBack();
    //         $this->errorResponse($e->getMessage());
    //     }
    //     //
    // }

    // public function update(Request $request, $id)
    // {
    //     DB::beginTransaction();
    //     try {
    //         $items = $request->all();
    //         $organogramData = !empty($items['organogramData']) ? $items['organogramData'] : null;
    //         $organogramSanctionPostData = !empty($items['organogramSacntionPostListData']) ? $items['organogramSacntionPostListData'] : null;


    //         $organogramId = isset($id) ? $id : null;
    //         if (empty($organogramId)) {
    //             throw new Exception("Organogram update fail!");
    //         }



    //         $organogramDataResult = $this->repository->update($organogramData, $organogramId);



    //         if (empty($organogramDataResult)) {
    //             throw new Exception("Organogram update fail!");
    //         }



    //           // Organogram Sanction Post
    //           if ($organogramSanctionPostData) {
    //             $organogramSanctionPostIds = array_column($organogramSanctionPostData, 'id');



    //             $this->organogramSanctionPostRepository->deleteOrganogramSanctionPostIds($organogramId, $organogramSanctionPostIds);

    //             foreach ($organogramSanctionPostData as $item) {

    //                 $organogramSanctionPostData = $item;
    //                 $organogramSanctionPostData['organogram_id'] = $organogramId;


    //                 if (!empty($item['id'])) {
    //                     $organogramSanctionPostDataResult = $this->organogramSanctionPostRepository->update($organogramSanctionPostData, $item['id']);
    //                 } else {
    //                 //       echo "<pre>";
    //                 // print_r($organogramSanctionPostData);
    //                 // echo "</pre>";
    //                 // exit();
    //                     $organogramSanctionPostDataResult = $this->organogramSanctionPostRepository->create($organogramSanctionPostData);
    //                 }
    //             }
    //         }

    //         DB::commit();
    //         $response = $this->repository->show($id);
    //         $response = ResourceService::getResources($response, OrganogramResource::class);
    //         return $this->successResponse($response);

    //     }
    //     catch (ValidationException $e) {
    //         DB::rollBack();
    //         throw new ValidatorException($e);
    //     }
    //     catch (\Exception $e) {
    //         DB::rollBack();
    //         $this->errorResponse($e->getMessage());
    //     }
    // }

    public function getOrganogramTree()
    {
        return $this->repository->getOrganogramTree();
    }

    public function getLabTree()
    {
        return $this->repository->getLabTree();
    }


    public function getOrganogramChildIds(Request $request)
    {
        $organogramId = $request->post('organogram_id');
        return $this->repository->getChildIds($organogramId);
    }

    public function syncDoptarOrganogram()
    {
        $doptarRestApiService = new DoptarRestApiService();
        $organogramList = $doptarRestApiService->getDoptarOrganogram(39);

        foreach ($organogramList as $item) {
            $organogramItem = [
                'id'                                    => $item->id,
                'organogram_id'                       => 1,
                // 'parent_id'                           => $item -> parent,
                'organogram_category_id'                => 1,
                // 'sarok'                              => $item -> sarok,
                // 'level'                              => $item -> level,
                // 'nothi'                              => $item -> nothi,
                'name_en'                               => $item->name,
                'name_bn'                               => $item->nameBn,
                'code'                                  => empty($item->code) ? null : $item->code,
                'division_id'                           => empty($item->division) ? null : $item->division,
                'district_id'                           => empty($item->district) ? null : $item->district,
                'upazila_id'                            => empty($item->upazila) ? null : $item->upazila,
                'phone'                                 => empty($item->phone) ? null : $item->phone,
                'mobile'                                => empty($item->mobile) ? null : $item->mobile,
                'digitalNothiCode'                      => empty($item->digitalNothiCode) ? null : $item->digitalNothiCode,
                'fax'                                   => empty($item->fax) ? null : $item->fax,
                'email'                                 => empty($item->email) ? null : $item->email,
                'website'                               => empty($item->website) ? null : $item->website,
                'ministry'                              => empty($item->ministry) ? null : $item->ministry,
                'layer'                                 => empty($item->layer) ? null : $item->layer,
                'origin'                                => empty($item->origin) ? null : $item->origin,
                'customLayer'                           => empty($item->customLayer) ? null : $item->customLayer,
                'created_by'                            =>  0,
                'updated_by'                            =>  null,
                'deleted_at'                            => null,
                'created_at'                            =>  null,
                'updated_at'                            =>  null,
                //  'sort_order'                          =>  0,
                'status'                                =>  1,
            ];

            $isExist = $this->repository->getOrganogramInfoById($organogramItem['id']);
            if (!empty($isExist)) {
                $organogramDataResult =  $this->repository->update($organogramItem, $organogramItem['id']);
            } else {

                // echo "<pre>";
                // print_r($organogramItem);
                // exit();

                $organogramDataResult =  $this->repository->create($organogramItem);
            }

            if (!empty($item)) {
                $organogramOfficeList = $doptarRestApiService->getOrganogramByOffice($item->id);
            }



            if (isset($organogramOfficeList->status) && $organogramOfficeList->status == 'error') {
                continue;
            }
            foreach ($organogramOfficeList as $itemOffice) {
                $organogramOfficeItem = [
                    'id'                                    => $itemOffice->id,
                    'organogram_id'                       => 1,
                    'parent_id'                           => $itemOffice->parent == 0 ? $itemOffice->office : $itemOffice->parent,
                    'organogram_category_id'                => 1,
                    'sarok'                              => $itemOffice->sarok,
                    'level'                              => $itemOffice->level,
                    'nothi'                              => $itemOffice->nothi,
                    'name_en'                               => $itemOffice->name,
                    'name_bn'                               => $itemOffice->nameBn,
                    //  'code'                                  => empty($itemOffice ->code) ? null : $itemOffice ->code,
                    // 'division_id'                           => empty($itemOffice ->division) ? null : $itemOffice ->division,
                    //'district_id'                           => empty($itemOffice ->district) ? null : $itemOffice ->district,
                    // 'upazila_id'                            => empty($itemOffice ->upazila) ? null : $itemOffice ->upazila,
                    'phone'                                 => empty($itemOffice->phone) ? null : $itemOffice->phone,
                    // 'mobile'                                => empty($itemOffice ->mobile) ? null : $itemOffice ->mobile,
                    // 'digitalNothiCode'                      => empty($itemOffice ->digitalNothiCode) ? null : $itemOffice               ->digitalNothiCode,
                    'fax'                                   => empty($itemOffice->fax) ? null : $itemOffice->fax,
                    'email'                                 => empty($itemOffice->email) ? null : $itemOffice->email,
                    // 'website'                               => empty($itemOffice ->website) ? null : $itemOffice ->website,
                    'ministry'                              => empty($itemOffice->ministry) ? null : $itemOffice->ministry,
                    'layer'                                 => empty($itemOffice->layer) ? null : $itemOffice->layer,
                    'officeoriginunitid'                                 => empty($itemOffice->officeoriginunitid) ? null : $itemOffice->officeoriginunitid,
                    'category'                                 => empty($itemOffice->category) ? null : $itemOffice->category,
                    'office'                                 => empty($itemOffice->office) ? null : $itemOffice->office,
                    // 'origin'                                => empty($itemOffice ->origin) ? null : $itemOffice ->origin,
                    //  'customLayer'                           => empty($itemOffice ->customLayer) ? null : $itemOffice ->customLayer,
                    'created_by'                            =>  0,
                    'updated_by'                            =>  null,
                    'deleted_at'                            => null,
                    'created_at'                            =>  null,
                    'updated_at'                            =>  null,
                    //  'sort_order'                          =>  0,
                    'status'                                =>  1,
                ];



                $isExist = $this->repository->getOrganogramInfoById($organogramOfficeItem['id']);
                if (!empty($isExist)) {
                    $organogramOfficeDataResult =  $this->repository->update($organogramOfficeItem, $organogramOfficeItem['id']);
                } else {
                    // echo "<pre>";
                    // print_r($organogramItem);
                    // exit();
                    $organogramOfficeDataResult =  $this->repository->create($organogramOfficeItem);
                }
                //  echo "<pre>";
                //     print_r($organogramOfficeDataResult);
                //     exit();
            }
        }
    }
}
