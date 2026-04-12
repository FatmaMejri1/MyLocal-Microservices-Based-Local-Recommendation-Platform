<?php

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use App\Entity\Categorie;

#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['categorie:read']]),
        new GetCollection(normalizationContext: ['groups' => ['categorie:read']]),
        new Post(
            normalizationContext: ['groups' => ['categorie:read']],
            denormalizationContext: ['groups' => ['categorie:write']],
            security: 'is_granted("ROLE_ADMIN")'
        ),
        new Put(
            normalizationContext: ['groups' => ['categorie:read']],
            denormalizationContext: ['groups' => ['categorie:write']],
            security: 'is_granted("ROLE_ADMIN")'
        ),
        new Delete(security: 'is_granted("ROLE_ADMIN")')
    ],
    normalizationContext: ['groups' => ['categorie:read']],
    denormalizationContext: ['groups' => ['categorie:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['name' => 'partial', 'description' => 'partial'])]
#[ApiFilter(OrderFilter::class, properties: ['name', 'id'])]
class CategorieResource
{
    // Cette classe sert uniquement de configuration pour API Platform
    // L'entité réelle est App\Entity\Categorie
}
