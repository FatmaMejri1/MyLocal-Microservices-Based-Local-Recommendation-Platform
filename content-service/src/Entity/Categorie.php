<?php

namespace App\Entity;

use App\Repository\CategorieRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CategorieRepository::class)]
class Categorie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['category:read', 'place:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Groups(['category:read', 'category:write', 'place:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['category:read', 'place:read'])]
    private ?string $icon = null;

    #[ORM\Column(length: 7, nullable: true)]
    #[Groups(['category:read'])]
    private ?string $color = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['category:read'])]
    private ?string $description = null;

    public function getId(): ?int { return $this->id; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getIcon(): ?string { return $this->icon; }
    public function setIcon(?string $icon): static { $this->icon = $icon; return $this; }

    public function getColor(): ?string { return $this->color; }
    public function setColor(?string $color): static { $this->color = $color; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function __toString(): string { return $this->name ?? ''; }
}
