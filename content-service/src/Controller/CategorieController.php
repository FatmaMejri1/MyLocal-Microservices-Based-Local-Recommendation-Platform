<?php

namespace App\Controller;

use App\Entity\Categorie;
use App\DTO\CategorieDTO;
use App\Service\CategorieService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/categories')]
class CategorieController extends AbstractController
{
    public function __construct(
        private CategorieService $categorieService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $categories = $this->categorieService->getAllCategories();
        return $this->json($categories, Response::HTTP_OK, [], ['groups' => ['category:read']]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $category = $this->categorieService->getCategoryById($id);

        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($category, Response::HTTP_OK, [], ['groups' => ['category:read']]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var CategorieDTO $categorieDTO */
        $categorieDTO = $this->serializer->deserialize($request->getContent(), CategorieDTO::class, 'json');

        $errors = $this->validator->validate($categorieDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        $category = new Categorie();
        $category->setName($categorieDTO->name);
        $category->setIcon($categorieDTO->icon);
        $category->setColor($categorieDTO->color);
        $category->setDescription($categorieDTO->description);

        $createdCategory = $this->categorieService->createCategory($category);

        return $this->json($createdCategory, Response::HTTP_CREATED, [], ['groups' => ['category:read']]);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $category = $this->categorieService->getCategoryById($id);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        /** @var CategorieDTO $categorieDTO */
        $categorieDTO = $this->serializer->deserialize($request->getContent(), CategorieDTO::class, 'json');

        $errors = $this->validator->validate($categorieDTO);
        if (count($errors) > 0) {
            return $this->json($errors, Response::HTTP_BAD_REQUEST);
        }

        $category->setName($categorieDTO->name ?? $category->getName());
        $category->setIcon($categorieDTO->icon ?? $category->getIcon());
        $category->setColor($categorieDTO->color ?? $category->getColor());
        $category->setDescription($categorieDTO->description ?? $category->getDescription());

        $updatedCategory = $this->categorieService->updateCategory($category);

        return $this->json($updatedCategory, Response::HTTP_OK, [], ['groups' => ['category:read']]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $category = $this->categorieService->getCategoryById($id);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], Response::HTTP_NOT_FOUND);
        }

        $this->categorieService->deleteCategory($category);
        return $this->json(['status' => 'deleted'], Response::HTTP_NO_CONTENT);
    }
}
