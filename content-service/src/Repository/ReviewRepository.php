<?php

namespace App\Repository;

use App\Entity\Review;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Review>
 *
 * @method Review|null find($id, $lockMode = null, $lockVersion = null)
 * @method Review|null findOneBy(array $criteria, array $orderBy = null)
 * @method Review[]    findAll()
 * @method Review[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Review::class);
    }

    /**
     * Find all reviews by place
     */
    public function findByPlaceId(int $placeId): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.placeId = :placeId')
            ->setParameter('placeId', $placeId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all reviews by user
     */
    public function findByUserId(int $userId): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.userId = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find published reviews only
     */
    public function findPublished(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.status = :status')
            ->setParameter('status', \App\Enum\ReviewStatus::PUBLISHED)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Check if a user has already reviewed a place
     */
    public function userHasReviewed(int $userId, int $placeId): bool
    {
        $count = $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->andWhere('r.userId = :userId')
            ->andWhere('r.placeId = :placeId')
            ->setParameter('userId', $userId)
            ->setParameter('placeId', $placeId)
            ->getQuery()
            ->getSingleScalarResult();

        return $count > 0;
    }

    /**
     * Calculate average rating for a place
     */
    public function calculateAverageRating(int $placeId): float
    {
        $result = $this->createQueryBuilder('r')
            ->select('AVG(r.rating) as average')
            ->andWhere('r.placeId = :placeId')
            ->andWhere('r.status = :status')
            ->setParameter('placeId', $placeId)
            ->setParameter('status', \App\Enum\ReviewStatus::PUBLISHED)
            ->getQuery()
            ->getSingleScalarResult();

        return $result ? (float) $result : 0.0;
    }
}
