<?php

namespace App\Entity;

use App\Repository\PlaceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\PlaceStatus;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: PlaceRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Place
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    #[Groups(['place:read', 'place:write'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $address = null;

    #[ORM\Column(type: "decimal", precision: 8, scale: 6)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $latitude = null;

    #[ORM\Column(type: "decimal", precision: 9, scale: 6)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $longitude = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $phone = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?array $hours = null;

    #[ORM\Column(enumType: PlaceStatus::class)]
    #[Groups(['place:read', 'place:write'])]
    private PlaceStatus $status;

    #[ORM\Column(type: "decimal", precision: 3, scale: 2, nullable: true)]
    #[Groups(['place:read'])]
    private ?string $averageRating = null;

    #[ORM\Column(type: "integer", options: ["default" => 0])]
    #[Groups(['place:read'])]
    private int $reviewsCount = 0;

    #[ORM\Column(type: "integer")]
    #[Groups(['place:read', 'place:write'])]
    private ?int $ownerId = null; // user-service

    #[ORM\Column(type: "integer")]
    #[Groups(['place:read', 'place:write'])]
    private ?int $categoryId = null; // category-service

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $imageUrl = null;

    #[ORM\Column]
    #[Groups(['place:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['place:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->status = PlaceStatus::VALIDATED; // Places appear immediately after creation
        $this->createdAt = new \DateTimeImmutable();
        $this->reviewsCount = 0;
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }


    // ---------- GETTERS & SETTERS ----------

    public function getId(): ?int { return $this->id; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }

    public function getAddress(): ?string { return $this->address; }
    public function setAddress(string $address): static { $this->address = $address; return $this; }

    public function getLatitude(): ?string { return $this->latitude; }
    public function setLatitude(string $latitude): static { $this->latitude = $latitude; return $this; }

    public function getLongitude(): ?string { return $this->longitude; }
    public function setLongitude(string $longitude): static { $this->longitude = $longitude; return $this; }

    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $phone): static { $this->phone = $phone; return $this; }

    public function getHours(): ?array { return $this->hours; }
    public function setHours(?array $hours): static { $this->hours = $hours; return $this; }

    public function getStatus(): PlaceStatus { return $this->status; }
    public function setStatus(PlaceStatus $status): static { $this->status = $status; return $this; }

    public function getAverageRating(): ?string { return $this->averageRating; }
    public function setAverageRating(?string $averageRating): static { $this->averageRating = $averageRating; return $this; }

    public function getOwnerId(): ?int { return $this->ownerId; }
    public function setOwnerId(int $ownerId): static { $this->ownerId = $ownerId; return $this; }

    public function getCategoryId(): ?int { return $this->categoryId; }
    public function setCategoryId(int $categoryId): static { $this->categoryId = $categoryId; return $this; }

    public function getImageUrl(): ?string { return $this->imageUrl; }
    public function setImageUrl(?string $imageUrl): static { $this->imageUrl = $imageUrl; return $this; }

    public function getReviewsCount(): int { return $this->reviewsCount; }
    public function setReviewsCount(int $reviewsCount): static { $this->reviewsCount = $reviewsCount; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
}
