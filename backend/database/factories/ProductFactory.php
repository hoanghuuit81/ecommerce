<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'name' => fake()->unique()->words(3, true),
            'sku' => fake()->unique()->bothify('SKU-#####??'),
            'slug' => fn (array $attributes): string => Str::slug($attributes['name']).'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->optional()->sentence(),
            'price' => fake()->randomFloat(2, 10, 10000000),
            'stock' => fake()->numberBetween(0, 500),
            'image' => fake()->optional()->imageUrl(640, 640, 'products'),
            'status' => fake()->boolean(85),
        ];
    }
}
