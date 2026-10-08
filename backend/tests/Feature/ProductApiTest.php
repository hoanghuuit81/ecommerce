<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_returns_paginated_products_filtered_by_search_category_and_status(): void
    {
        $phones = Category::factory()->create();
        $laptops = Category::factory()->create();
        Product::factory()->for($phones)->create(['name' => 'Điện thoại A', 'sku' => 'PHONE-A', 'status' => true]);
        Product::factory()->for($phones)->create(['name' => 'Điện thoại B', 'sku' => 'PHONE-B', 'status' => false]);
        Product::factory()->for($laptops)->create(['name' => 'Laptop A', 'sku' => 'LAPTOP-A', 'status' => true]);

        $response = $this->getJson("/api/products?search=Điện thoại&category_id={$phones->id}&status=1&per_page=1");

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.sku', 'PHONE-A')
            ->assertJsonPath('data.0.category.id', $phones->id);
    }

    public function test_valid_payload_creates_product_and_returns_201(): void
    {
        $category = Category::factory()->create();
        $payload = [
            'category_id' => $category->id,
            'name' => 'Tai nghe không dây',
            'sku' => 'TWD-001',
            'description' => 'Kết nối Bluetooth.',
            'price' => 1290000,
            'stock' => 10,
            'image' => 'https://example.com/tai-nghe.jpg',
            'status' => true,
        ];

        $response = $this->postJson('/api/products', $payload);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Tai nghe không dây')
            ->assertJsonPath('data.category.id', $category->id);

        $this->assertDatabaseHas('products', [
            'sku' => 'TWD-001',
            'slug' => 'tai-nghe-khong-day',
            'stock' => 10,
        ]);
    }

    public function test_returns_422_when_product_payload_is_invalid(): void
    {
        $response = $this->postJson('/api/products', [
            'sku' => 'INVALID',
            'price' => -1,
            'stock' => -1,
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'name', 'price', 'stock', 'status']);
    }

    public function test_updates_product_without_rejecting_its_existing_sku(): void
    {
        $product = Product::factory()->create(['sku' => 'KEEP-SKU']);

        $response = $this->putJson("/api/products/{$product->id}", [
            'category_id' => $product->category_id,
            'name' => 'Sản phẩm đã cập nhật',
            'sku' => 'KEEP-SKU',
            'description' => null,
            'price' => 200000,
            'stock' => 0,
            'image' => null,
            'status' => false,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.sku', 'KEEP-SKU')
            ->assertJsonPath('data.stock', 0)
            ->assertJsonPath('data.status', false);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Sản phẩm đã cập nhật',
            'sku' => 'KEEP-SKU',
        ]);
    }

    public function test_deletes_product_and_returns_204(): void
    {
        $product = Product::factory()->create();

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertNoContent();

        $this->assertModelMissing($product);
    }
}
