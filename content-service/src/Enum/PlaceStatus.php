<?php

namespace App\Enum;

enum PlaceStatus: string
{
    case PENDING = 'PENDING';
    case VALIDATED = 'VALIDATED';
    case REJECTED = 'REJECTED';
    case ARCHIVED = 'ARCHIVED';
}
