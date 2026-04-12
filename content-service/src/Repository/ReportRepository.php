<?php

namespace App\Repository;

use App\Entity\Report;
use App\Enum\ReportStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Report>
 *
 * @method Report|null find($id, $lockMode = null, $lockVersion = null)
 * @method Report|null findOneBy(array $criteria, array $orderBy = null)
 * @method Report[]    findAll()
 * @method Report[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ReportRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Report::class);
    }

    /**
     * Find all pending reports (for admin moderation)
     */
    public function findPending(): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.status = :status')
            ->setParameter('status', ReportStatus::PENDING)
            ->orderBy('r.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find reports by status
     */
    public function findByStatus(ReportStatus $status): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.status = :status')
            ->setParameter('status', $status)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find all reports by a specific reporter
     */
    public function findByReporterId(int $reporterId): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.reporterId = :reporterId')
            ->setParameter('reporterId', $reporterId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find reports for a specific place
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
     * Find reports for a specific review
     */
    public function findByReviewId(int $reviewId): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.reviewId = :reviewId')
            ->setParameter('reviewId', $reviewId)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find reports handled by a specific admin
     */
    public function findByAdminId(int $adminId): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.adminId = :adminId')
            ->setParameter('adminId', $adminId)
            ->orderBy('r.processedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Count reports by status (for admin dashboard)
     */
    public function countByStatus(ReportStatus $status): int
    {
        return $this->createQueryBuilder('r')
            ->select('COUNT(r.id)')
            ->andWhere('r.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Get recent reports (last 30 days)
     */
    public function findRecentReports(int $days = 30): array
    {
        $date = new \DateTimeImmutable(sprintf('-%d days', $days));

        return $this->createQueryBuilder('r')
            ->andWhere('r.createdAt >= :date')
            ->setParameter('date', $date)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find duplicate reports (same reporter, same target)
     */
    public function findDuplicateReports(int $reporterId, ?int $placeId = null, ?int $reviewId = null): array
    {
        $qb = $this->createQueryBuilder('r')
            ->andWhere('r.reporterId = :reporterId')
            ->setParameter('reporterId', $reporterId);

        if ($placeId) {
            $qb->andWhere('r.placeId = :placeId')
                ->setParameter('placeId', $placeId);
        }

        if ($reviewId) {
            $qb->andWhere('r.reviewId = :reviewId')
                ->setParameter('reviewId', $reviewId);
        }

        return $qb->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Save a report entity
     */
    public function save(Report $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * Remove a report entity
     */
    public function remove(Report $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
