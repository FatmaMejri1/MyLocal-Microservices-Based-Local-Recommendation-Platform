<?php

namespace App\Entity;

use App\Repository\PhotoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PhotoRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Photo
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $url = null;

    #[ORM\Column(type: "text", nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private bool $isMain = false;

    #[ORM\Column(nullable: true)]
    private ?int $placeId = null;  // FK vers place-service

    #[ORM\Column(nullable: true)]
    private ?int $userId = null;   // optionnel : FK vers user-service

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->isMain = false;
    }

    // ------------------- GETTERS & SETTERS -------------------

    public function getId(): ?int { return $this->id; }

    public function getUrl(): ?string { return $this->url; }
    public function setUrl(string $url): static { $this->url = $url; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }

    public function isMain(): bool { return $this->isMain; }
    public function setIsMain(bool $isMain): static { $this->isMain = $isMain; return $this; }

    public function getPlaceId(): ?int { return $this->placeId; }
    public function setPlaceId(?int $placeId): static { $this->placeId = $placeId; return $this; }

    public function getUserId(): ?int { return $this->userId; }
    public function setUserId(?int $userId): static { $this->userId = $userId; return $this; }
}
