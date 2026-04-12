<?php

namespace App\Controller;

use App\Entity\Favorite;
use App\DTO\FavoriteDTO;
use App\Service\FavoriteService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/favorites')]
class FavoriteController extends AbstractController
{
    public function __construct(
        private FavoriteService $favoriteService,
        private \App\Service\PlaceService $placeService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/user/{userId}', methods: ['GET'])]
    public function listByUser(int $userId): JsonResponse
    {
        $favorites = $this->favoriteService->getUserFavorites($userId);
        return $this->json($favorites, Response::HTTP_OK, [], ['groups' => ['favorite:read', 'place:read']]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $favorite = $this->favoriteService->getFavoriteById($id);

        if (!$favorite) {
            return $this->json(['error' => 'Favorite not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($favorite, Response::HTTP_OK, [], ['groups' => ['favorite:read', 'place:read']]);
    }

    #[Route('/', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var FavoriteDTO $favoriteDTO */
        $favoriteDTO = $this->serializer->deserialize($request->getContent(), FavoriteDTO::class, 'json');

        $errors = $this->validator->validate($favoriteDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        $place = $this->placeService->getPlaceById($favoriteDTO->placeId);
        if (!$place) {
            return $this->json(['error' => 'Place not found'], Response::HTTP_NOT_FOUND);
        }

        $favorite = new Favorite();
        $favorite->setUserId($favoriteDTO->userId);
        $favorite->setPlaceId($favoriteDTO->placeId);
        $favorite->setPlace($place);

        try {
            $createdFavorite = $this->favoriteService->addFavorite($favorite);
            return $this->json($createdFavorite, Response::HTTP_CREATED, [], ['groups' => ['favorite:read', 'place:read']]);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/user/{userId}/place/{placeId}', methods: ['DELETE'])]
    public function deleteByUserAndPlace(int $userId, int $placeId): JsonResponse
    {
        $this->favoriteService->removeFavoriteByUserAndPlace($userId, $placeId);
        return $this->json(['status' => 'deleted'], Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $favorite = $this->favoriteService->getFavoriteById($id);
        if (!$favorite) {
            return $this->json(['error' => 'Favorite not found'], Response::HTTP_NOT_FOUND);
        }

        $this->favoriteService->removeFavorite($favorite);
        return $this->json(['status' => 'deleted'], Response::HTTP_NO_CONTENT);
    }

    #[Route('/user/{userId}/place/{placeId}/check', methods: ['GET'])]
    public function checkFavorite(int $userId, int $placeId): JsonResponse
    {
        $isFavorited = $this->favoriteService->isPlaceFavoritedByUser($userId, $placeId);
        return $this->json(['isFavorited' => $isFavorited], Response::HTTP_OK);
    }
}
