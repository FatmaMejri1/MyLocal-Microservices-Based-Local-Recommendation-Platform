<?php

namespace App\Enum;

enum ReviewStatus: string
{
    case PUBLISHED = 'PUBLISHED';
    case REPORTED = 'REPORTED';
    case MODERATED = 'MODERATED';
    case DELETED = 'DELETED';
}
