<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Entity\Favorite;

#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['favorite:read']],
            security: 'is_granted("FAVORITE_VIEW", object)'
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['favorite:read']],
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            normalizationContext: ['groups' => ['favorite:read']],
            denormalizationContext: ['groups' => ['favorite:write']],
            security: 'is_granted("ROLE_USER")'
        ),
        new Delete(
            security: 'is_granted("FAVORITE_DELETE", object)'
        )
    ],
    normalizationContext: ['groups' => ['favorite:read']],
    denormalizationContext: ['groups' => ['favorite:write']]
)]
#[ApiFilter(SearchFilter::class, properties: [
    'userId' => 'exact',
    'placeId' => 'exact'
])]
class FavoriteResource
{
    // L'entité réelle est App\Entity\Favorite
}
