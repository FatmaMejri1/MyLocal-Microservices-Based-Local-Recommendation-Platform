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
use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use App\Entity\Place;

#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['place:read', 'place:item']],
            security: 'is_granted("PLACE_VIEW", object)'
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['place:read']],
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            normalizationContext: ['groups' => ['place:read']],
            denormalizationContext: ['groups' => ['place:write']],
            security: 'is_granted("ROLE_USER")',
            validationContext: ['groups' => ['Default', 'place:create']]
        ),
        new Put(
            normalizationContext: ['groups' => ['place:read']],
            denormalizationContext: ['groups' => ['place:write']],
            security: 'is_granted("PLACE_EDIT", object)'
        ),
        new Delete(
            security: 'is_granted("PLACE_DELETE", object)'
        ),
        // Opérations admin
        new Patch(
            uriTemplate: '/places/{id}/validate',
            denormalizationContext: ['groups' => ['place:admin']],
            security: 'is_granted("ROLE_ADMIN")',
            name: 'place_validate'
        ),
        new Patch(
            uriTemplate: '/places/{id}/reject',
            denormalizationContext: ['groups' => ['place:admin']],
            security: 'is_granted("ROLE_ADMIN")',
            name: 'place_reject'
        )
    ],
    normalizationContext: ['groups' => ['place:read']],
    denormalizationContext: ['groups' => ['place:write']]
)]
#[ApiFilter(SearchFilter::class, properties: [
    'name' => 'partial',
    'address' => 'partial',
    'description' => 'partial',
    'status' => 'exact'
])]
#[ApiFilter(OrderFilter::class, properties: [
    'name', 'averageRating', 'createdAt', 'id'
])]
#[ApiFilter(RangeFilter::class, properties: ['averageRating'])]
#[ApiFilter(BooleanFilter::class, properties: ['status' => 'exact'])]
class PlaceResource
{
    // L'entité réelle est App\Entity\Place
}
