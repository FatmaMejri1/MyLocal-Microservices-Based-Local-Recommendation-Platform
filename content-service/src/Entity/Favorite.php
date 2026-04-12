<?php

namespace App\Entity;

use App\Repository\FavoriteRepository;
use Doctrine\ORM\Mapping as ORM;

use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: FavoriteRepository::class)]
class Favorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['favorite:read'])]
    private ?int $id = null;

    #[ORM\Column(type: "integer")]
    #[Groups(['favorite:read'])]
    private ?int $userId = null;

    #[ORM\Column(type: "integer")]
    #[Groups(['favorite:read'])]
    private ?int $placeId = null;

    #[Groups(['favorite:read'])]
    private ?Place $place = null;

    #[ORM\Column]
    #[Groups(['favorite:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUserId(): ?int { return $this->userId; }
    public function setUserId(int $userId): static { $this->userId = $userId; return $this; }
    
    public function getPlaceId(): ?int { return $this->placeId; }
    public function setPlaceId(int $placeId): static { $this->placeId = $placeId; return $this; }

    public function getPlace(): ?Place { return $this->place; }
    public function setPlace(?Place $place): static { $this->place = $place; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}
