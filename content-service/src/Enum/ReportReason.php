<?php
// src/Enum/ReportReason.php
namespace App\Enum;

enum ReportReason: string
{
    case SPAM = 'SPAM';
    case INAPPROPRIATE = 'INAPPROPRIATE';
    case FALSE_REVIEW = 'FALSE_REVIEW';
    case HARASSMENT = 'HARASSMENT';
    case INCORRECT_INFORMATION = 'INCORRECT_INFORMATION';
}
