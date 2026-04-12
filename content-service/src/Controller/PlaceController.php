<?php

namespace App\Controller;

use App\DTO\PlaceDTO;
use App\Entity\Place;
use App\Repository\PlaceRepository;
use App\Service\PlaceService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/places')]
class PlaceController extends AbstractController
{
    public function __construct(
        private PlaceService $placeService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'app_place_list', methods: ['GET'])]
    #[Route('/', name: 'app_place_list_slash', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $places = $this->placeService->getAllPlaces();
        return $this->json($places, Response::HTTP_OK, [], ['groups' => ['place:read']]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show($id): JsonResponse  // ← CHANGÉ: $id au lieu de int $id
    {
        // Convertir en int manuellement
        $id = (int) $id;

        $place = $this->placeService->getPlaceById($id);

        if (!$place) {
            return $this->json(['error' => 'Place not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($place, Response::HTTP_OK, [], ['groups' => ['place:read']]);
    }

    #[Route('', name: 'app_place_create', methods: ['POST'])]
    #[Route('/', name: 'app_place_create_slash', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var PlaceDTO $placeDTO */
        $placeDTO = $this->serializer->deserialize($request->getContent(), PlaceDTO::class, 'json');

        $errors = $this->validator->validate($placeDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        $place = new Place();
        $place->setName($placeDTO->name);
        $place->setAddress($placeDTO->address);
        $place->setDescription($placeDTO->description);
        $place->setLatitude($placeDTO->latitude);
        $place->setLongitude($placeDTO->longitude);
        $place->setPhone($placeDTO->phone);
        $place->setHours($placeDTO->hours);
        $place->setOwnerId($placeDTO->ownerId);
        $place->setCategoryId($placeDTO->categoryId);
        $place->setImageUrl($placeDTO->imageUrl);

        $createdPlace = $this->placeService->createPlace($place);

        return $this->json($createdPlace, Response::HTTP_CREATED, [], ['groups' => ['place:read']]);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update($id, Request $request): JsonResponse  // ← CHANGÉ: $id au lieu de int $id
    {
        $id = (int) $id;  // ← Conversion manuelle

        $place = $this->placeService->getPlaceById($id);
        if (!$place) {
            return $this->json(['error' => 'Place not found'], Response::HTTP_NOT_FOUND);
        }

        /** @var PlaceDTO $placeDTO */
        $placeDTO = $this->serializer->deserialize($request->getContent(), PlaceDTO::class, 'json');

        $errors = $this->validator->validate($placeDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        $place->setName($placeDTO->name ?? $place->getName());
        $place->setAddress($placeDTO->address ?? $place->getAddress());
        $place->setDescription($placeDTO->description ?? $place->getDescription());
        $place->setLatitude($placeDTO->latitude ?? $place->getLatitude());
        $place->setLongitude($placeDTO->longitude ?? $place->getLongitude());
        $place->setPhone($placeDTO->phone ?? $place->getPhone());
        $place->setHours($placeDTO->hours ?? $place->getHours());
        $place->setCategoryId($placeDTO->categoryId ?? $place->getCategoryId());
        $place->setImageUrl($placeDTO->imageUrl ?? $place->getImageUrl());

        $updatedPlace = $this->placeService->updatePlace($place);

        return $this->json($updatedPlace, Response::HTTP_OK, [], ['groups' => ['place:read']]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete($id): JsonResponse  // ← CHANGÉ: $id au lieu de int $id
    {
        $id = (int) $id;  // ← Conversion manuelle

        $place = $this->placeService->getPlaceById($id);
        if (!$place) {
            return $this->json(['error' => 'Place not found'], Response::HTTP_NOT_FOUND);
        }

        $this->placeService->deletePlace($place);
        return $this->json(['status' => 'deleted'], Response::HTTP_NO_CONTENT);
    }

    #[Route('/search', methods: ['GET'])]
    public function search(Request $request, PlaceRepository $placeRepository): JsonResponse
    {
        $keyword = $request->query->get('q', '');

        if (empty($keyword)) {
            return $this->json([], Response::HTTP_OK);
        }

        $places = $placeRepository->searchByName($keyword);
        
        return $this->json($places, Response::HTTP_OK, [], ['groups' => ['place:read']]);
    }

    #[Route('/category/{categoryId}', methods: ['GET'])]
    public function byCategory($categoryId): JsonResponse
    {
        $categoryId = (int) $categoryId;

        $places = $this->placeService->getPlacesByCategory($categoryId);
        return $this->json($places, Response::HTTP_OK, [], ['groups' => ['place:read']]);
    }

    #[Route('/user/{userId}', methods: ['GET'])]
    public function byUser($userId, PlaceRepository $placeRepository): JsonResponse
    {
        $userId = (int) $userId;
        $places = $placeRepository->findBy(['ownerId' => $userId]);
        return $this->json($places, Response::HTTP_OK, [], ['groups' => ['place:read']]);
    }
}
