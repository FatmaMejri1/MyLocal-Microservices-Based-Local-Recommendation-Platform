<?php
// src/Enum/ReportStatus.php
namespace App\Enum;

enum ReportStatus: string
{
    case PENDING = 'PENDING';
    case IN_PROGRESS = 'IN_PROGRESS';
    case RESOLVED = 'RESOLVED';
    case REJECTED = 'REJECTED';
}
