<?php

namespace App\Repository;

use App\Entity\Favorite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Favorite>
 *
 * @method Favorite|null find($id, $lockMode = null, $lockVersion = null)
 * @method Favorite|null findOneBy(array $criteria, array $orderBy = null)
 * @method Favorite[]    findAll()
 * @method Favorite[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FavoriteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Favorite::class);
    }

    /**
     * Find all favorites for a given user
     */
    public function findByUserId(int $userId): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.userId = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('f.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Check if a user has favorited a specific place
     */
    public function findByUserAndPlace(int $userId, int $placeId): ?Favorite
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.userId = :userId')
            ->andWhere('f.placeId = :placeId')
            ->setParameter('userId', $userId)
            ->setParameter('placeId', $placeId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Delete all favorites for a given place (useful when a place is removed)
     */
    public function removeByPlaceId(int $placeId): int
    {
        return $this->createQueryBuilder('f')
            ->delete()
            ->andWhere('f.placeId = :placeId')
            ->setParameter('placeId', $placeId)
            ->getQuery()
            ->execute();
    }
}
