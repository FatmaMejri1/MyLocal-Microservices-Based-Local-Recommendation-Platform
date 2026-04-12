<?php

namespace App\Service;

use App\Entity\Report;
use App\Enum\ReportStatus;
use App\Repository\ReportRepository;
use Doctrine\ORM\EntityManagerInterface;

class ReportService
{
    private EntityManagerInterface $em;
    private ReportRepository $reportRepository;

    public function __construct(EntityManagerInterface $em, ReportRepository $reportRepository)
    {
        $this->em = $em;
        $this->reportRepository = $reportRepository;
    }

    public function createReport(Report $report): Report
    {
        $this->em->persist($report);
        $this->em->flush();
        return $report;
    }

    public function updateReport(Report $report): Report
    {
        $this->em->flush();
        return $report;
    }

    public function getReportById(int $id): ?Report
    {
        return $this->reportRepository->find($id);
    }

    public function getReportsByPlace(int $placeId): array
    {
        return $this->reportRepository->findByPlaceId($placeId);
    }

    public function getReportsByReview(int $reviewId): array
    {
        return $this->reportRepository->findByReviewId($reviewId);
    }

    public function getPendingReports(): array
    {
        return $this->reportRepository->findPending();
    }

    public function getReportsByReporter(int $reporterId): array
    {
        return $this->reportRepository->findByReporterId($reporterId);
    }

    public function updateReportStatus(int $reportId, ReportStatus $status, ?int $adminId = null): ?Report
    {
        $report = $this->getReportById($reportId);
        if (!$report) {
            return null;
        }

        $report->setStatus($status);
        if ($adminId) {
            $report->setAdminId($adminId);
        }

        if ($status === ReportStatus::RESOLVED || $status === ReportStatus::REJECTED) {
            $report->setProcessedAt(new \DateTimeImmutable());
        }

        $this->em->flush();
        return $report;
    }

    public function deleteReport(Report $report): void
    {
        $this->em->remove($report);
        $this->em->flush();
    }

    public function getReportStatistics(): array
    {
        return [
            'pending' => $this->reportRepository->countByStatus(ReportStatus::PENDING),
            'in_progress' => $this->reportRepository->countByStatus(ReportStatus::IN_PROGRESS),
            'resolved' => $this->reportRepository->countByStatus(ReportStatus::RESOLVED),
            'rejected' => $this->reportRepository->countByStatus(ReportStatus::REJECTED),
        ];
    }
}
