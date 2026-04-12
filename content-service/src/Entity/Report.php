<?php

namespace App\Entity;

use App\Enum\ReportReason;
use App\Enum\ReportStatus;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Report
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(enumType: ReportReason::class)]
    private ReportReason $reason;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(enumType: ReportStatus::class)]
    private ReportStatus $status;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $processedAt = null;

    #[ORM\Column(type: "integer")]
    private int $reporterId;

    #[ORM\Column(type: "integer", nullable: true)]
    private ?int $reviewId = null;

    #[ORM\Column(type: "integer", nullable: true)]
    private ?int $placeId = null;

    #[ORM\Column(type: "integer", nullable: true)]
    private ?int $adminId = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->status = ReportStatus::PENDING;
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // ---------- GETTERS & SETTERS ----------
    public function getId(): ?int { return $this->id; }
    public function getReason(): ReportReason { return $this->reason; }
    public function setReason(ReportReason $reason): static { $this->reason = $reason; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }
    public function getStatus(): ReportStatus { return $this->status; }
    public function setStatus(ReportStatus $status): static { $this->status = $status; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getProcessedAt(): ?\DateTimeImmutable { return $this->processedAt; }
    public function setProcessedAt(?\DateTimeImmutable $processedAt): static { $this->processedAt = $processedAt; return $this; }
    public function getReporterId(): int { return $this->reporterId; }
    public function setReporterId(int $reporterId): static { $this->reporterId = $reporterId; return $this; }
    public function getReviewId(): ?int { return $this->reviewId; }
    public function setReviewId(?int $reviewId): static { $this->reviewId = $reviewId; return $this; }
    public function getPlaceId(): ?int { return $this->placeId; }
    public function setPlaceId(?int $placeId): static { $this->placeId = $placeId; return $this; }
    public function getAdminId(): ?int { return $this->adminId; }
    public function setAdminId(?int $adminId): static { $this->adminId = $adminId; return $this; }
}
