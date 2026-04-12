<?php

namespace App\Entity;

use App\Repository\ReviewRepository;
use App\Enum\ReviewStatus;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Review
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['review:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['review:read'])]
    private ?string $content = null;

    #[ORM\Column(type: "integer")]
    #[Groups(['review:read'])]
    private ?int $rating = null;

    #[ORM\Column(enumType: ReviewStatus::class)]
    private ReviewStatus $status;

    #[ORM\Column]
    #[Groups(['review:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: "integer")]
    #[Groups(['review:read'])]
    private int $userId;

    #[ORM\Column(type: "integer")]
    #[Groups(['review:read'])]
    private int $placeId;

    public function __construct()
    {
        $this->status = ReviewStatus::PUBLISHED;
        $this->createdAt = new \DateTimeImmutable();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // ---------- GETTERS & SETTERS ----------
    public function getId(): ?int { return $this->id; }
    public function getContent(): ?string { return $this->content; }
    public function setContent(string $content): static { $this->content = $content; return $this; }
    public function getRating(): ?int { return $this->rating; }
    public function setRating(int $rating): static { $this->rating = $rating; return $this; }
    public function getStatus(): ReviewStatus { return $this->status; }
    public function setStatus(ReviewStatus $status): static { $this->status = $status; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUserId(): int { return $this->userId; }
    public function setUserId(int $userId): static { $this->userId = $userId; return $this; }
    public function getPlaceId(): int { return $this->placeId; }
    public function setPlaceId(int $placeId): static { $this->placeId = $placeId; return $this; }
}
