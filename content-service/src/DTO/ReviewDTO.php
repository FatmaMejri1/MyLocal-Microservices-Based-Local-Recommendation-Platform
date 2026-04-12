<?php

namespace App\DTO;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

class ReviewDTO
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 10, max: 1000)]
    #[Groups(['review:write', 'review:read'])]
    public ?string $content = null;

    #[Assert\NotNull]
    #[Assert\Range(min: 1, max: 5)]
    #[Groups(['review:write', 'review:read'])]
    public ?int $rating = null;

    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['review:write', 'review:read'])]
    public ?int $userId = null;

    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['review:write', 'review:read'])]
    public ?int $placeId = null;
}
