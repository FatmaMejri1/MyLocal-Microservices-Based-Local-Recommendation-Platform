<?php

namespace App\DTO;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

class PlaceDTO
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    #[Groups(['place:write', 'place:read'])]
    public ?string $name = null;

    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    #[Groups(['place:write', 'place:read'])]
    public ?string $address = null;

    #[Assert\Length(max: 1000)]
    #[Groups(['place:write', 'place:read'])]
    public ?string $description = null;

    #[Assert\NotNull]
    #[Assert\Type('float')]
    #[Assert\Range(min: -90, max: 90)]
    #[Groups(['place:write', 'place:read'])]
    public ?float $latitude = null;

    #[Assert\NotNull]
    #[Assert\Type('float')]
    #[Assert\Range(min: -180, max: 180)]
    #[Groups(['place:write', 'place:read'])]
    public ?float $longitude = null;

    #[Assert\Regex(pattern: '/^\+?[0-9\s\-\(\)]{7,}$/')]
    #[Groups(['place:write', 'place:read'])]
    public ?string $phone = null;

    #[Assert\All([
        new Assert\Collection([
            'day' => new Assert\NotBlank(),
            'open' => new Assert\NotBlank(),
            'close' => new Assert\NotBlank(),
        ])
    ])]
    #[Groups(['place:write', 'place:read'])]
    public ?array $hours = null;

    #[Assert\Length(max: 500)]
    #[Groups(['place:write', 'place:read'])]
    public ?string $imageUrl = null;

    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['place:write', 'place:read'])]
    public ?int $ownerId = null;

    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['place:write', 'place:read'])]
    public ?int $categoryId = null;
}
