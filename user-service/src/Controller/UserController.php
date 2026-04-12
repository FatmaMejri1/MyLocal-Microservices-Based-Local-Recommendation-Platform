<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/users')]
class UserController extends AbstractController
{
    // LIST
    #[Route('', name: 'user_index', methods: ['GET'])]
    public function index(UserRepository $userRepository): JsonResponse
    {
        return $this->json(
            $userRepository->findAll(),
            Response::HTTP_OK,
            [],
            ['groups' => ['user:read']]
        );
    }

    // CREATE
    #[Route('', name: 'user_create', methods: ['POST'])]
    public function create(Request $request, UserRepository $userRepository): JsonResponse
    {
        try {
        $data = json_decode($request->getContent(), true);

            // Check if JSON is valid
            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->json(
                    ['message' => 'Invalid JSON: ' . json_last_error_msg()],
                    Response::HTTP_BAD_REQUEST
                );
            }

            // Validation
            if (empty($data['firstName']) || empty($data['lastName']) || empty($data['email']) || empty($data['password'])) {
                return $this->json(
                    ['message' => 'Missing required fields: firstName, lastName, email, password'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            // Check if email already exists
            try {
                $existingUser = $userRepository->findOneBy(['email' => $data['email']]);
                if ($existingUser) {
                    return $this->json(
                        ['message' => 'Email already exists'],
                        Response::HTTP_CONFLICT
                    );
                }
            } catch (\Exception $e) {
                // If database query fails, log but continue (might be connection issue)
                error_log('Error checking existing user: ' . $e->getMessage());
            }

        $user = new User();
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setEmail($data['email']);
        $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        $user->setPhone($data['phone'] ?? null);
        $user->setCity($data['city'] ?? null);

            $userRepository->add($user, true); // flush immediately

        return $this->json(
            $user,
            Response::HTTP_CREATED,
            [],
            ['groups' => ['user:read']]
        );
        } catch (\Doctrine\DBAL\Exception\ConnectionException $e) {
            return $this->json(
                ['message' => 'Database connection error. Please check your database configuration.'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        } catch (\Doctrine\DBAL\Exception\TableNotFoundException $e) {
            return $this->json(
                ['message' => 'Database table not found. Please run migrations: php bin/console doctrine:migrations:migrate'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        } catch (\Exception $e) {
            // Log the full error for debugging
            error_log('User creation error: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            
            return $this->json(
                [
                    'message' => 'Failed to create user: ' . $e->getMessage(),
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    // READ ONE
    #[Route('/{id}', name: 'user_show', methods: ['GET'])]
    public function show($id, UserRepository $userRepository): JsonResponse
    {
        $id = (int)$id;
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        return $this->json(
            $user,
            Response::HTTP_OK,
            [],
            ['groups' => ['user:read']]
        );
    }

    // UPDATE
    #[Route('/{id}', name: 'user_update', methods: ['PUT'])]
    public function update(
        $id,
        Request $request,
        UserRepository $userRepository
    ): JsonResponse {
        $id = (int)$id;
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        $data = json_decode($request->getContent(), true);

        $user->setFirstName($data['firstName'] ?? $user->getFirstName());
        $user->setLastName($data['lastName'] ?? $user->getLastName());
        $user->setPhone($data['phone'] ?? $user->getPhone());
        $user->setCity($data['city'] ?? $user->getCity());
        
        // Handle avatar update (can be null to remove avatar)
        if (isset($data['avatar'])) {
            $user->setAvatar($data['avatar'] ?: null);
        }

        if (!empty($data['password'])) {
            $user->setPassword(password_hash($data['password'], PASSWORD_BCRYPT));
        }

        $userRepository->add($user, true); // Flush immediately to save to database

        return $this->json(
            $user,
            Response::HTTP_OK,
            [],
            ['groups' => ['user:read']]
        );
    }

    // LOGIN
    #[Route('/login', name: 'user_login', methods: ['POST'])]
    public function login(Request $request, UserRepository $userRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (empty($data['email']) || empty($data['password'])) {
                return $this->json(
                    ['message' => 'Email and password are required'],
                    Response::HTTP_BAD_REQUEST
                );
            }

            // Diagnostic logging
            error_log('Login attempt for email: ' . $data['email']);

            $user = $userRepository->findOneBy(['email' => $data['email']]);

            if (!$user) {
                error_log('User not found for email: ' . $data['email']);
                return $this->json(
                    ['message' => 'Invalid email or password'],
                    Response::HTTP_UNAUTHORIZED
                );
            }

            if (!password_verify($data['password'], $user->getPassword())) {
                error_log('Password verification failed for email: ' . $data['email']);
                return $this->json(
                    ['message' => 'Invalid email or password'],
                    Response::HTTP_UNAUTHORIZED
                );
            }

            // Return user data (manually constructed to avoid serializer issues)
            $userData = [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phone' => $user->getPhone(),
                'city' => $user->getCity(),
                'avatar' => $user->getAvatar(),
                'roles' => $user->getRoles(),
                'status' => $user->getStatus()->value,
            ];

            return $this->json(
                $userData,
                Response::HTTP_OK
            );
        } catch (\Doctrine\DBAL\Exception\ConnectionException $e) {
            error_log('Database connection error during login: ' . $e->getMessage());
            return $this->json(
                ['message' => 'Database connection error'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        } catch (\Exception $e) {
            error_log('Login exception: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            return $this->json(
                [
                    'message' => 'Login failed: ' . $e->getMessage(),
                    'trace' => $e->getTraceAsString() // For debugging only
                ],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    // DELETE
    #[Route('/{id}', name: 'user_delete', methods: ['DELETE'])]
    public function delete($id, UserRepository $userRepository): JsonResponse
    {
        $id = (int)$id;
        $user = $userRepository->find($id);

        if (!$user) {
            return $this->json(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }
        $userRepository->remove($user);

        return $this->json(
            ['message' => 'User deleted successfully'],
            Response::HTTP_NO_CONTENT
        );
    }
}
