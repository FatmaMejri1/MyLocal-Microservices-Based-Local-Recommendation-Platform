<?php

namespace App\Service;

use App\Entity\Categorie;
use App\Repository\CategorieRepository;
use Doctrine\ORM\EntityManagerInterface;

class CategorieService
{
    private EntityManagerInterface $em;
    private CategorieRepository $categorieRepository;

    public function __construct(EntityManagerInterface $em, CategorieRepository $categorieRepository)
    {
        $this->em = $em;
        $this->categorieRepository = $categorieRepository;
    }

    public function createCategory(Categorie $category): Categorie
    {
        $this->em->persist($category);
        $this->em->flush();

        return $category;
    }

    public function updateCategory(Categorie $category): Categorie
    {
        $this->em->flush();

        return $category;
    }

    public function deleteCategory(Categorie $category): void
    {
        $this->em->remove($category);
        $this->em->flush();
    }

    public function getCategoryById(int $id): ?Categorie
    {
        return $this->categorieRepository->find($id);
    }

    public function getAllCategories(): array
    {
        return $this->categorieRepository->findAll();
    }
}
