<?php

namespace App\Controller;

use App\Entity\Report;
use App\DTO\ReportDTO;
use App\Enum\ReportStatus;
use App\Service\ReportService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/reports')]
class ReportController extends AbstractController
{
    public function __construct(
        private ReportService $reportService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $status = $request->query->get('status');

        if ($status) {
            $reports = $this->reportService->getReportsByStatus(ReportStatus::from($status));
        } else {
            $reports = $this->reportService->getPendingReports();
        }

        return $this->json($reports, Response::HTTP_OK);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $report = $this->reportService->getReportById($id);

        if (!$report) {
            return $this->json(['error' => 'Report not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($report, Response::HTTP_OK);
    }

    #[Route('/', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var ReportDTO $reportDTO */
        $reportDTO = $this->serializer->deserialize($request->getContent(), ReportDTO::class, 'json');

        $errors = $this->validator->validate($reportDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        $report = new Report();
        $report->setReason($reportDTO->reason);
        $report->setDescription($reportDTO->description);

        // Set reporter ID from DTO
        $report->setReporterId($reportDTO->reporterId);

        if ($reportDTO->reviewId) {
            $report->setReviewId($reportDTO->reviewId);
        }

        if ($reportDTO->placeId) {
            $report->setPlaceId($reportDTO->placeId);
        }

        $createdReport = $this->reportService->createReport($report);

        return $this->json($createdReport, Response::HTTP_CREATED);
    }

    #[Route('/{id}/status', methods: ['PATCH'])]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $report = $this->reportService->getReportById($id);
        if (!$report) {
            return $this->json(['error' => 'Report not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $status = ReportStatus::from($data['status'] ?? '');

        // In real scenario, get admin ID from authenticated user
        $adminId = 1; // Temporary - should be $this->getUser()->getId()

        $updatedReport = $this->reportService->updateReportStatus($id, $status, $adminId);

        return $this->json($updatedReport, Response::HTTP_OK);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $report = $this->reportService->getReportById($id);
        if (!$report) {
            return $this->json(['error' => 'Report not found'], Response::HTTP_NOT_FOUND);
        }

        $this->reportService->deleteReport($report);
        return $this->json(['status' => 'deleted'], Response::HTTP_NO_CONTENT);
    }

    #[Route('/stats', methods: ['GET'])]
    public function statistics(): JsonResponse
    {
        $stats = $this->reportService->getReportStatistics();
        return $this->json($stats, Response::HTTP_OK);
    }
}
