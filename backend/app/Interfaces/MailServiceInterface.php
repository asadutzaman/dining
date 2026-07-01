<?php

namespace App\Interfaces;

interface MailServiceInterface
{
    public static function sendMail($email, $subject, $data=[], $blade='common',$type='async');

    public function sendInvitationMail(AccountUser $user);

    public function sendConfirmationMail(AccountUser $account_user , User $user );

    public static function sendVerifyCode($sendEmail,$code);

    public function sendEmailByMailJob(MailJobTemplate $mailJobTemplate);

}
