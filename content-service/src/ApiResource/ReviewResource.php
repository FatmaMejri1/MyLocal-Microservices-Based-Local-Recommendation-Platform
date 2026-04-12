<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\RangeFilter;
use App\Entity\Review;

#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['review:read']],
            security: 'is_granted("REVIEW_VIEW", object)'
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['review:read']],
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            normalizationContext: ['groups' => ['review:read']],
            denormalizationContext: ['groups' => ['review:write']],
            security: 'is_granted("ROLE_USER")',
            validationContext: ['groups' => ['Default', 'review:create']]
        ),
        new Put(
            normalizationContext: ['groups' => ['review:read']],
            denormalizationContext: ['groups' => ['review:write']],
            security: 'is_granted("REVIEW_EDIT", object)'
        ),
        new Delete(
            security: 'is_granted("REVIEW_DELETE", object)'
        ),
        // Opération de signalement
        new Patch(
            uriTemplate: '/reviews/{id}/report',
            security: 'is_granted("ROLE_USER")',
            name: 'review_report'
        ),
        // Opérations admin
        new Patch(
            uriTemplate: '/reviews/{id}/moderate',
            denormalizationContext: ['groups' => ['review:admin']],
            security: 'is_granted("ROLE_ADMIN")',
            name: 'review_moderate'
        )
    ],
    normalizationContext: ['groups' => ['review:read']],
    denormalizationContext: ['groups' => ['review:write']]
)]
#[ApiFilter(SearchFilter::class, properties: [
    'placeId' => 'exact',
    'userId' => 'exact',
    'status' => 'exact'
])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'rating', 'id'])]
#[ApiFilter(RangeFilter::class, properties: ['rating'])]
class ReviewResource
{
    // L'entité réelle est App\Entity\Review
}
