import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CATEGORY_TREE } from './categories.data';

@Controller('categories')
export class CategoriesController {

  // ✅ GET ALL DATA
  @Get('all')
  getAllCategories() {
    return CATEGORY_TREE;
  }

  // ✅ GET ONLY CATEGORY NAMES
  @Get()
  getCategories() {
    return Object.keys(CATEGORY_TREE);
  }

  // ✅ GET SUBCATEGORIES
  @Get(':category')
  getSubcategories(@Param('category') category: string) {
    const data = CATEGORY_TREE[category];
    if (!data) throw new NotFoundException('Category not found');
    return Object.keys(data);
  }

  // ✅ GET PRODUCT TYPES
  @Get(':category/:subcategory')
  getTypes(
    @Param('category') category: string,
    @Param('subcategory') subcategory: string
  ) {
    const data = CATEGORY_TREE[category]?.[subcategory];
    if (!data) throw new NotFoundException('Subcategory not found');
    return data;
  }
}
