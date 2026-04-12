<?php

namespace App\Service;

use App\Entity\Favorite;
use App\Repository\FavoriteRepository;
use App\Repository\PlaceRepository;
use Doctrine\ORM\EntityManagerInterface;

class FavoriteService
{
    private EntityManagerInterface $em;
    private FavoriteRepository $favoriteRepository;
    private PlaceRepository $placeRepository;

    public function __construct(
        EntityManagerInterface $em, 
        FavoriteRepository $favoriteRepository,
        PlaceRepository $placeRepository
    )
    {
        $this->em = $em;
        $this->favoriteRepository = $favoriteRepository;
        $this->placeRepository = $placeRepository;
    }

    public function addFavorite(Favorite $favorite): Favorite
    {
        // Check if favorite already exists
        $existing = $this->favoriteRepository->findByUserAndPlace(
            $favorite->getUserId(),
            $favorite->getPlaceId()
        );

        if ($existing) {
            throw new \Exception('This place is already in your favorites');
        }

        $this->em->persist($favorite);
        $this->em->flush();

        return $favorite;
    }

    public function removeFavorite(Favorite $favorite): void
    {
        $this->em->remove($favorite);
        $this->em->flush();
    }

    public function removeFavoriteByUserAndPlace(int $userId, int $placeId): void
    {
        $favorite = $this->favoriteRepository->findByUserAndPlace($userId, $placeId);
        if ($favorite) {
            $this->em->remove($favorite);
            $this->em->flush();
        }
    }

    public function getUserFavorites(int $userId): array
    {
        $favorites = $this->favoriteRepository->findByUserId($userId);
        
        // Manually inflate Place data
        foreach ($favorites as $favorite) {
            $place = $this->placeRepository->find($favorite->getPlaceId());
            if ($place) {
                $favorite->setPlace($place);
            }
        }
        
        return $favorites;
    }

    public function isPlaceFavoritedByUser(int $userId, int $placeId): bool
    {
        return $this->favoriteRepository->findByUserAndPlace($userId, $placeId) !== null;
    }

    public function getFavoriteById(int $id): ?Favorite
    {
        return $this->favoriteRepository->find($id);
    }
}
