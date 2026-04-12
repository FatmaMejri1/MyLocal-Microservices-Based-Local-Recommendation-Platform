<?php

namespace App\Service;

use App\Entity\Place;
use App\Enum\PlaceStatus;
use App\Repository\PlaceRepository;
use Doctrine\ORM\EntityManagerInterface;

class PlaceService
{
    private EntityManagerInterface $em;
    private PlaceRepository $placeRepository;

    public function __construct(EntityManagerInterface $em, PlaceRepository $placeRepository)
    {
        $this->em = $em;
        $this->placeRepository = $placeRepository;
    }

    public function createPlace(Place $place): Place
    {
        // Set default status to VALIDATED so places appear immediately
        if (!$place->getStatus()) {
            $place->setStatus(PlaceStatus::VALIDATED);
        }

        $this->em->persist($place);
        $this->em->flush();
        return $place;
    }

    public function updatePlace(Place $place): Place
    {
        $this->em->flush();
        return $place;
    }

    public function deletePlace(Place $place): void
    {
        $this->em->remove($place);
        $this->em->flush();
    }

    public function getPlaceById(int $id): ?Place
    {
        return $this->placeRepository->find($id);
    }

    public function getAllPlaces(): array
    {
        // Only return VALIDATED places so they appear on discover page
        return $this->placeRepository->findBy(['status' => PlaceStatus::VALIDATED], ['createdAt' => 'DESC']);
    }

    public function getPlacesByOwner(int $ownerId): array
    {
        return $this->placeRepository->findByOwnerId($ownerId);
    }

    public function searchPlaces(string $keyword): array
    {
        return $this->placeRepository->searchByName($keyword);
    }

    public function getPlacesByCategory(int $categoryId): array
    {
        return $this->placeRepository->findByCategoryId($categoryId);
    }

    public function getHighlyRatedPlaces(float $minRating = 4.0): array
    {
        return $this->placeRepository->findByMinRating($minRating);
    }

    public function updatePlaceStatus(int $placeId, PlaceStatus $status): ?Place
    {
        $place = $this->getPlaceById($placeId);
        if (!$place) {
            return null;
        }

        $place->setStatus($status);
        $this->em->flush();

        return $place;
    }

    public function getApprovedPlaces(): array
    {
        return $this->placeRepository->findBy(['status' => PlaceStatus::VALIDATED]);
    }
}
