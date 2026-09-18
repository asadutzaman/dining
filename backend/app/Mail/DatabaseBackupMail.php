<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DatabaseBackupMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(protected string $dumpPath, protected string $fileName)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Dining database backup - ' . now()->format('Y-m-d H:i'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.databaseBackup.databaseBackup',
            with: ['generatedAt' => now()->format('Y-m-d H:i:s')],
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromPath($this->dumpPath)
                ->as($this->fileName)
                ->withMime('application/sql'),
        ];
    }
}
