<?php

namespace App\DTO;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

class FavoriteDTO
{
    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['favori:write', 'favori:read'])]
    public ?int $userId = null;

    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['favori:write', 'favori:read'])]
    public ?int $placeId = null;
}
