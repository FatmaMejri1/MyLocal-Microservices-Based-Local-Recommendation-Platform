<?php

namespace App\Controller;

use App\Entity\Photo;
use App\Repository\PhotoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

#[Route('/api/photos')]
class PhotoController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private PhotoRepository $photoRepository;
    private SerializerInterface $serializer;

    public function __construct(EntityManagerInterface $entityManager, PhotoRepository $photoRepository, SerializerInterface $serializer)
    {
        $this->entityManager = $entityManager;
        $this->photoRepository = $photoRepository;
        $this->serializer = $serializer;
    }

    #[Route('', name: 'api_photos_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $photos = $this->photoRepository->findAll();
        $json = $this->serializer->serialize($photos, 'json');
        
        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_photos_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $photo = $this->photoRepository->find($id);

        if (!$photo) {
            return new JsonResponse(['error' => 'Photo not found'], Response::HTTP_NOT_FOUND);
        }

        $json = $this->serializer->serialize($photo, 'json');

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/place/{placeId}', name: 'api_photos_by_place', methods: ['GET'])]
    public function findByPlace(int $placeId): JsonResponse
    {
        $photos = $this->photoRepository->findBy(['placeId' => $placeId]);
        $json = $this->serializer->serialize($photos, 'json');

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('', name: 'api_photos_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        file_put_contents(__DIR__.'/../../../debug_media_upload.txt', 
          "FILES: " . print_r($_FILES, true) . 
          "\nPOST: " . print_r($_POST, true) . 
          "\nIs File?: " . ($request->files->get('file') ? 'YES' : 'NO') .
          "\n", 
          FILE_APPEND
        );
        try {
            $url = null;
            $placeId = null;
            $userId = null;
            $description = null;
            $isMain = false;

            $file = $request->files->get('file');

            if ($file) {
                // Handle File Upload
                $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
                if (!file_exists($uploadDir)) {
                    if (!mkdir($uploadDir, 0777, true) && !is_dir($uploadDir)) {
                        throw new \RuntimeException(sprintf('Directory "%s" was not created', $uploadDir));
                    }
                }
                
                $extension = $file->guessExtension() ?? 'jpg';
                $filename = uniqid() . '.' . $extension;
                $file->move($uploadDir, $filename);
                
                // WE ASSUME media-service runs on port 8003
                $url = 'http://localhost:8003/uploads/' . $filename;
                
                $placeId = $request->request->get('placeId') ? (int)$request->request->get('placeId') : null;
                $userId = $request->request->get('userId') ? (int)$request->request->get('userId') : null;
                $description = $request->request->get('description');
                $isMain = $request->request->getBoolean('isMain');
            } else {
                // Handle JSON
                $data = json_decode($request->getContent(), true);
                if (isset($data['url'])) $url = $data['url'];
                if (isset($data['placeId'])) $placeId = $data['placeId'];
                if (isset($data['userId'])) $userId = $data['userId'];
                if (isset($data['description'])) $description = $data['description'];
                if (isset($data['isMain'])) $isMain = $data['isMain'];
            }

            if (!$url) {
                return new JsonResponse(['error' => 'Missing required fields: url or file'], Response::HTTP_BAD_REQUEST);
            }

            $photo = new Photo();
            $photo->setUrl($url);
            $photo->setPlaceId($placeId);
            $photo->setDescription($description);
            $photo->setIsMain($isMain);
            if ($userId) $photo->setUserId((int)$userId);

            $this->entityManager->persist($photo);
            $this->entityManager->flush();

            // Return manual array to ensure URL is present regardless of serializer config
            return new JsonResponse([
                'id' => $photo->getId(),
                'url' => $photo->getUrl(),
                'placeId' => $photo->getPlaceId(),
                'isMain' => $photo->isMain()
            ], Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            return new JsonResponse([
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'api_photos_update', methods: ['PUT'])]
    public function update(Request $request, int $id): JsonResponse
    {
        $photo = $this->photoRepository->find($id);

        if (!$photo) {
            return new JsonResponse(['error' => 'Photo not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['url'])) {
            $photo->setUrl($data['url']);
        }
        
        if (isset($data['placeId'])) {
            $photo->setPlaceId((int)$data['placeId']);
        }

        if (isset($data['description'])) {
            $photo->setDescription($data['description']);
        }

        if (isset($data['isMain'])) {
            $photo->setIsMain((bool)$data['isMain']);
        }

        if (isset($data['userId'])) {
            $photo->setUserId((int)$data['userId']);
        }

        $this->entityManager->flush();

        $json = $this->serializer->serialize($photo, 'json');

        return new JsonResponse($json, Response::HTTP_OK, [], true);
    }

    #[Route('/{id}', name: 'api_photos_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $photo = $this->photoRepository->find($id);

        if (!$photo) {
             return new JsonResponse(['error' => 'Photo not found'], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($photo);
        $this->entityManager->flush();

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
