<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_returns_paginated_categories_filtered_by_search_and_status(): void
    {
        Category::factory()->create(['name' => 'Laptop', 'status' => true]);
        Category::factory()->create(['name' => 'Laptop cũ', 'status' => false]);
        Category::factory()->create(['name' => 'Điện thoại', 'status' => true]);

        $response = $this->getJson('/api/categories?search=Laptop&status=1&per_page=1');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.name', 'Laptop')
            ->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_valid_payload_creates_category_and_returns_201(): void
    {
        $payload = [
            'name' => 'Máy ảnh',
            'description' => 'Máy ảnh và phụ kiện.',
            'status' => true,
        ];

        $response = $this->postJson('/api/categories', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Máy ảnh')
            ->assertJsonPath('data.slug', 'may-anh');

        $this->assertDatabaseHas('categories', [
            'name' => 'Máy ảnh',
            'slug' => 'may-anh',
            'status' => true,
        ]);
    }

    public function test_returns_422_when_category_payload_is_invalid(): void
    {
        $response = $this->postJson('/api/categories', []);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'status']);
    }

    public function test_updates_category_and_generates_a_new_slug_when_name_changes(): void
    {
        $category = Category::factory()->create(['name' => 'Thiết bị cũ', 'slug' => 'thiet-bi-cu']);

        $response = $this->putJson("/api/categories/{$category->id}", [
            'name' => 'Thiết bị mới',
            'description' => 'Mô tả mới.',
            'status' => false,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.slug', 'thiet-bi-moi')
            ->assertJsonPath('data.status', false);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Thiết bị mới',
            'status' => false,
        ]);
    }

    public function test_returns_409_when_category_still_has_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->create();

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response
            ->assertConflict()
            ->assertJsonPath('message', 'Không thể xóa danh mục vẫn còn sản phẩm.');

        $this->assertModelExists($category);
    }

    public function test_deletes_empty_category_and_returns_204(): void
    {
        $category = Category::factory()->create();

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertNoContent();

        $this->assertModelMissing($category);
    }
}
