<?php

namespace App\Service;

use App\Entity\Review;
use App\Enum\ReviewStatus;
use App\Repository\ReviewRepository;
use App\Repository\PlaceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ReviewService
{
    public function __construct(
        private EntityManagerInterface $em,
        private ReviewRepository $reviewRepository,
        private PlaceRepository $placeRepository
    ) {}

    public function createReview(Review $review): Review
    {
        // 1. Vérifier si l'utilisateur a déjà avisé ce lieu
        if ($this->userHasReviewed($review->getUserId(), $review->getPlaceId())) {
            throw new BadRequestHttpException('You have already reviewed this place');
        }

        // 2. Valider la note (1-5)
        if ($review->getRating() < 1 || $review->getRating() > 5) {
            throw new BadRequestHttpException('Rating must be between 1 and 5');
        }

        // 3. Définir le statut par défaut
        if (!$review->getStatus()) {
            $review->setStatus(ReviewStatus::PUBLISHED);
        }

        $this->em->persist($review);
        $this->em->flush();

        // 4. Mettre à jour les stats du lieu (note moyenne et nombre d'avis)
        $this->updatePlaceStats($review->getPlaceId());

        return $review;
    }

    public function updateReview(Review $review): Review
    {
        $this->em->flush();

        // Mettre à jour les stats du lieu
        $this->updatePlaceStats($review->getPlaceId());

        return $review;
    }

    public function deleteReview(Review $review): void
    {
        $placeId = $review->getPlaceId();

        $this->em->remove($review);
        $this->em->flush();

        // Mettre à jour les stats du lieu
        $this->updatePlaceStats($placeId);
    }

    public function getReviewById(int $id): Review
    {
        $review = $this->reviewRepository->find($id);

        if (!$review) {
            throw new NotFoundHttpException('Review not found');
        }

        return $review;
    }

    public function getReviewsByPlace(int $placeId, bool $publishedOnly = true): array
    {
        if ($publishedOnly) {
            return $this->reviewRepository->findBy([
                'placeId' => $placeId,
                'status' => ReviewStatus::PUBLISHED
            ]);
        }

        return $this->reviewRepository->findByPlaceId($placeId);
    }

    public function getReviewsByUser(int $userId): array
    {
        return $this->reviewRepository->findByUserId($userId);
    }

    public function userHasReviewed(int $userId, int $placeId): bool
    {
        return $this->reviewRepository->userHasReviewed($userId, $placeId);
    }

    public function getReportedReviews(): array
    {
        return $this->reviewRepository->findBy(['status' => ReviewStatus::REPORTED]);
    }

    public function reportReview(int $reviewId): Review
    {
        $review = $this->getReviewById($reviewId);
        $review->setStatus(ReviewStatus::REPORTED);

        $this->em->flush();
        return $review;
    }

    private function updatePlaceStats(int $placeId): void
    {
        $average = $this->reviewRepository->calculateAverageRating($placeId);
        $count = $this->reviewRepository->count(['placeId' => $placeId, 'status' => ReviewStatus::PUBLISHED]);

        $place = $this->placeRepository->find($placeId);
        if ($place) {
            $place->setAverageRating((string) $average);
            $place->setReviewsCount($count);
            $this->em->flush();
        }
    }

    public function getAllReviews(): array
    {
        return $this->reviewRepository->findAll();
    }

    public function calculateAverageRating(int $placeId): float
    {
        return $this->reviewRepository->calculateAverageRating($placeId);
    }

    public function getReviewStatistics(): array
    {
        return [
            'total' => $this->reviewRepository->count([]),
            'published' => $this->reviewRepository->count(['status' => ReviewStatus::PUBLISHED]),
            'reported' => $this->reviewRepository->count(['status' => ReviewStatus::REPORTED]),
            'average_rating' => $this->getGlobalAverageRating(),
        ];
    }

    private function getGlobalAverageRating(): float
    {
        $result = $this->reviewRepository->createQueryBuilder('r')
            ->select('AVG(r.rating) as average')
            ->where('r.status = :status')
            ->setParameter('status', ReviewStatus::PUBLISHED)
            ->getQuery()
            ->getSingleResult();

        return $result['average'] ? (float) $result['average'] : 0.0;
    }
}
