<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApprovalNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $mailData;
    public $mailType;
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($mailData, $mailType)
    {
        $this->mailData = $mailData;
        $this->mailType = $mailType;
    }

    /**
     * Get the message envelope.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    public function envelope()
    {
        return new Envelope(
            subject: $this->mailData['subject'],
        );
    }

    /**
     * Get the message content definition.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    {
        switch ($this->mailType) {
            case 'REQUISITION_UPDATE_MAIL':
                return new Content(
                    view: 'emails.requisition.requisitionUpdate',
                    with: [
                        'mailData' => $this->mailData,
                    ],
                );
                break;
            case 'QUOTATION_REQUEST_UPDATE_MAIL':
                return new Content(
                    view: 'emails.quotationRequest.quotationRequestUpdate',
                    with: [
                        'mailData' => $this->mailData,
                    ],
                );
                break;
            case 'PURCHASE_ORDER_UPDATE_MAIL':
                return new Content(
                    view: 'emails.purchaseOrder.purchaseOrderUpdate',
                    with: [
                        'mailData' => $this->mailData,
                    ],
                );
                break;
            case 'PRODUCTION_TRANSFER_MAIL':
                return new Content(
                    view: 'emails.productionTransfer.productionTransferUpdate',
                    with: [
                        'mailData' => $this->mailData,
                    ],
                );
                break;
            case 'MATERIAL_RETURN_MAIL':
                return new Content(
                    view: 'emails.materialReturn.materialReturnUpdate',
                    with: [
                        'mailData' => $this->mailData,
                    ],
                );
                break;
            case 'STOCK_ADJUSTMENT_MAIL':
                return new Content(
                    view: 'emails.stockAdjustment.stockAdjustmentUpdate',
                    with: [
                        'mailData' => $this->mailData,
                    ],
                );
                break;

            default:
                # code...
                break;
        }


        // if ($this->mailType == 'REQUISITION_UPDATE_MAIL') {
        //     return new Content(
        //         view: 'emails.requisition.requisitionUpdate',
        //         with: [
        //             'mailData' => $this->mailData,
        //         ],
        //     );
        // } else if ($this->mailType == 'QUOTATION_REQUEST_UPDATE_MAIL') {
        //     return new Content(
        //         view: 'emails.quotationRequest.quotationRequestUpdate',
        //         with: [
        //             'mailData' => $this->mailData,
        //         ],
        //     );
        // } else if ($this->mailType == 'PURCHASE_ORDER_UPDATE_MAIL') {
        //     return new Content(
        //         view: 'emails.purchaseOrder.purchaseOrderUpdate',
        //         with: [
        //             'mailData' => $this->mailData,
        //         ],
        //     );
        // } else if ($this->mailType == 'PRODUCTION_TRANSFER_MAIL') {
        //     return new Content(
        //         view: 'emails.productionTransfer.productionTransferUpdate',
        //         with: [
        //             'mailData' => $this->mailData,
        //         ],
        //     );
        // } else if ($this->mailType == 'MATERIAL_RETURN_MAIL') {
        //     return new Content(
        //         view: 'emails.materialReturn.materialReturnUpdate',
        //         with: [
        //             'mailData' => $this->mailData,
        //         ],
        //     );
        // }
    }

    /**
     * Get the attachments for the message.
     *
     * @return array
     */
    public function attachments()
    {
        return [];
    }
}
