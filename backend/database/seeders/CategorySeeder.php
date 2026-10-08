<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Điện thoại', 'slug' => 'dien-thoai', 'description' => 'Điện thoại và phụ kiện chính hãng.'],
            ['name' => 'Laptop', 'slug' => 'laptop', 'description' => 'Laptop phục vụ học tập và công việc.'],
            ['name' => 'Âm thanh', 'slug' => 'am-thanh', 'description' => 'Tai nghe, loa và thiết bị âm thanh.'],
            ['name' => 'Thiết bị gia dụng', 'slug' => 'thiet-bi-gia-dung', 'description' => 'Đồ gia dụng thông minh cho gia đình.'],
            ['name' => 'Phụ kiện', 'slug' => 'phu-kien', 'description' => 'Phụ kiện công nghệ thiết yếu.'],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [...$category, 'status' => true],
            );
        }
    }
}
