<?php

namespace App\DTO;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use App\Enum\ReportReason;

class ReportDTO
{
    #[Assert\NotNull]
    #[Groups(['report:write', 'report:read'])]
    public ?ReportReason $reason = null;

    #[Assert\Length(max: 1000)]
    #[Groups(['report:write', 'report:read'])]
    public ?string $description = null;

    #[Assert\Positive]
    #[Groups(['report:write', 'report:read'])]
    public ?int $reviewId = null;

    #[Assert\Positive]
    #[Groups(['report:write', 'report:read'])]
    public ?int $placeId = null;

    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['report:write', 'report:read'])]
    public ?int $reporterId = null;

    // Note: adminId and status are handled by services
    // and should not be exposed in write operations for security
}
