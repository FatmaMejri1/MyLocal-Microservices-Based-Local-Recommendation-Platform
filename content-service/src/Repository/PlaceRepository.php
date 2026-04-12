<?php

namespace App\Repository;

use App\Entity\Place;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Place>
 *
 * @method Place|null find($id, $lockMode = null, $lockVersion = null)
 * @method Place|null findOneBy(array $criteria, array $orderBy = null)
 * @method Place[]    findAll()
 * @method Place[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PlaceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Place::class);
    }

    /**
     * Find all places created by a given user (owner)
     */
    public function findByOwnerId(int $ownerId): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.ownerId = :ownerId')
            ->setParameter('ownerId', $ownerId)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search places by name (LIKE %xxx%)
     */
    public function searchByName(string $keyword): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('LOWER(p.name) LIKE :keyword')
            ->setParameter('keyword', '%' . strtolower($keyword) . '%')
            ->orderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Filter places by category
     */
    public function findByCategoryId(int $categoryId): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.categoryId = :cat')
            ->setParameter('cat', $categoryId)
            ->getQuery()
            ->getResult();
    }

    /**
     * Get places with minimum rating (ex: >= 4.0 stars)
     */
    public function findByMinRating(float $minRating): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.averageRating >= :rating')
            ->setParameter('rating', $minRating)
            ->orderBy('p.averageRating', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
