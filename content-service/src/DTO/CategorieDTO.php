<?php

namespace App\DTO;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

class CategorieDTO
{
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    #[Groups(['category:write', 'category:read'])]
    public ?string $name = null;

    #[Assert\Length(max: 50)]
    #[Groups(['category:write', 'category:read'])]
    public ?string $icon = null;

    #[Assert\Regex(pattern: '/^#[0-9A-Fa-f]{6}$/')]
    #[Groups(['category:write', 'category:read'])]
    public ?string $color = null;

    #[Assert\Length(max: 500)]
    #[Groups(['category:write', 'category:read'])]
    public ?string $description = null;
}
