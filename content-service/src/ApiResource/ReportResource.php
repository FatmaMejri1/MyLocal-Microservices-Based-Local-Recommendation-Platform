<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Entity\Report;

#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['report:read']],
            security: 'is_granted("REPORT_VIEW", object)'
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['report:read']],
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            normalizationContext: ['groups' => ['report:read']],
            denormalizationContext: ['groups' => ['report:write']],
            security: 'is_granted("ROLE_USER")',
            validationContext: ['groups' => ['Default', 'report:create']]
        ),
        new Patch(
            normalizationContext: ['groups' => ['report:read']],
            denormalizationContext: ['groups' => ['report:admin']],
            security: 'is_granted("ROLE_ADMIN")',
            name: 'report_update_status'
        ),
        new Delete(
            security: 'is_granted("ROLE_ADMIN")'
        )
    ],
    normalizationContext: ['groups' => ['report:read']],
    denormalizationContext: ['groups' => ['report:write']]
)]
#[ApiFilter(SearchFilter::class, properties: [
    'status' => 'exact',
    'reporterId' => 'exact',
    'placeId' => 'exact',
    'reviewId' => 'exact',
    'adminId' => 'exact'
])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'processedAt', 'id'])]
class ReportResource
{
    // L'entité réelle est App\Entity\Report
}
