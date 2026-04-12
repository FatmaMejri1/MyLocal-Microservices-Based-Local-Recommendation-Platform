<?php

namespace App\Controller;

use App\Entity\Review;
use App\DTO\ReviewDTO;
use App\Service\ReviewService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/reviews')]
class ReviewController extends AbstractController
{
    public function __construct(
        private ReviewService $reviewService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $placeId = $request->query->get('placeId');
        $userId = $request->query->get('userId');

        if ($placeId) {
            $reviews = $this->reviewService->getReviewsByPlace((int) $placeId);
        } elseif ($userId) {
            $reviews = $this->reviewService->getReviewsByUser((int) $userId);
        } else {
            // Par défaut, retourner tous les avis (ou les publiés seulement)
            $reviews = $this->reviewService->getAllReviews();  // À créer
        }

        return $this->json($reviews, Response::HTTP_OK, [], ['groups' => ['review:read']]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $review = $this->reviewService->getReviewById($id);

        if (!$review) {
            return $this->json(['error' => 'Review not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($review, Response::HTTP_OK, [], ['groups' => ['review:read']]);
    }

    #[Route('/', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        // Authentication handled via DTO userId for now


        /** @var ReviewDTO $reviewDTO */
        $reviewDTO = $this->serializer->deserialize($request->getContent(), ReviewDTO::class, 'json');

        $errors = $this->validator->validate($reviewDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        // Vérifier la note
        if ($reviewDTO->rating < 1 || $reviewDTO->rating > 5) {
            return $this->json(['error' => 'Rating must be between 1 and 5'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'utilisateur a déjà avisé ce lieu
        if ($this->reviewService->userHasReviewed($reviewDTO->userId, $reviewDTO->placeId)) {
            return $this->json(['error' => 'You have already reviewed this place'], Response::HTTP_BAD_REQUEST);
        }

        $review = new Review();
        $review->setContent($reviewDTO->content);
        $review->setRating($reviewDTO->rating);
        $review->setUserId($reviewDTO->userId);
        $review->setPlaceId($reviewDTO->placeId);

        try {
            $createdReview = $this->reviewService->createReview($review);
            return $this->json($createdReview, Response::HTTP_CREATED, [], ['groups' => ['review:read']]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        // TODO: Replace with actual authentication
        $userId = 1; // Mock user ID for testing

        $review = $this->reviewService->getReviewById($id);
        if (!$review) {
            return $this->json(['error' => 'Review not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur est l'auteur (disabled for testing)
        // if ($review->getUserId() !== $userId) {
        //     return $this->json(['error' => 'You are not allowed to update this review'], Response::HTTP_FORBIDDEN);
        // }

        /** @var ReviewDTO $reviewDTO */
        $reviewDTO = $this->serializer->deserialize($request->getContent(), ReviewDTO::class, 'json');

        $errors = $this->validator->validate($reviewDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        // Vérifier la note si fournie
        if ($reviewDTO->rating && ($reviewDTO->rating < 1 || $reviewDTO->rating > 5)) {
            return $this->json(['error' => 'Rating must be between 1 and 5'], Response::HTTP_BAD_REQUEST);
        }

        $review->setContent($reviewDTO->content ?? $review->getContent());
        if ($reviewDTO->rating) {
            $review->setRating($reviewDTO->rating);
        }

        try {
            $updatedReview = $this->reviewService->updateReview($review);
            return $this->json($updatedReview, Response::HTTP_OK, [], ['groups' => ['review:read']]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        // TODO: Replace with actual authentication
        $userId = 1; // Mock user ID for testing

        $review = $this->reviewService->getReviewById($id);
        if (!$review) {
            return $this->json(['error' => 'Review not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier les permissions (disabled for testing)
        // if ($review->getUserId() !== $userId) {
        //     return $this->json(['error' => 'You are not allowed to delete this review'], Response::HTTP_FORBIDDEN);
        // }

        try {
            $this->reviewService->deleteReview($review);
            return $this->json(['status' => 'deleted'], Response::HTTP_NO_CONTENT);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/place/{placeId}', methods: ['GET'])]
    public function byPlace(int $placeId, Request $request): JsonResponse
    {
        $page = $request->query->get('page', 1);
        $limit = $request->query->get('limit', 10);

        $reviews = $this->reviewService->getReviewsByPlace($placeId, true); // published only
        return $this->json($reviews, Response::HTTP_OK, [], ['groups' => ['review:read']]);
    }

    #[Route('/user/{userId}', methods: ['GET'])]
    public function byUser(int $userId): JsonResponse
    {
        // TODO: Add proper authentication check

        $reviews = $this->reviewService->getReviewsByUser($userId);
        return $this->json($reviews, Response::HTTP_OK, [], ['groups' => ['review:read']]);
    }

    #[Route('/place/{placeId}/average-rating', methods: ['GET'])]
    public function averageRating(int $placeId): JsonResponse
    {
        $average = $this->reviewService->calculateAverageRating($placeId);
        return $this->json(['averageRating' => $average], Response::HTTP_OK);
    }

    // ========== ENDPOINTS ADMIN ==========

    #[Route('/admin/reported', methods: ['GET'])]
    public function reportedReviews(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $reviews = $this->reviewService->getReportedReviews();
        return $this->json($reviews, Response::HTTP_OK, [], ['groups' => ['review:read']]);
    }

    #[Route('/{id}/report', methods: ['POST'])]
    public function report(int $id): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $review = $this->reviewService->reportReview($id);
            return $this->json($review, Response::HTTP_OK, [], ['groups' => ['review:read']]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
