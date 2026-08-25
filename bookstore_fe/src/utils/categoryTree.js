export const buildCategoryTree = (categories = []) => {
    const nodesById = new Map();
    const roots = [];

    categories.forEach((category) => {
        nodesById.set(String(category.id), {
            ...category,
            children: [],
        });
    });

    categories.forEach((category) => {
        const node = nodesById.get(String(category.id));
        const parentId =
            category.parentCategory?.id ??
            category.parentCategoryId ??
            category.parent_id ??
            null;

        if (parentId && nodesById.has(String(parentId))) {
            nodesById.get(String(parentId)).children.push(node);
            return;
        }

        roots.push(node);
    });

    const sortNodes = (nodes) => {
        nodes.sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || ""), "vi"),
        );
        nodes.forEach((node) => sortNodes(node.children));
    };

    sortNodes(roots);
    return roots;
};

export const flattenCategoryTree = (
    nodes = [],
    depth = 0,
    parentNames = [],
) => {
    return nodes.flatMap((node) => {
        const fullPath = [...parentNames, node.name]
            .filter(Boolean)
            .join(" / ");
        return [
            {
                ...node,
                depth,
                fullPath,
                hasChildren:
                    Array.isArray(node.children) && node.children.length > 0,
            },
            ...flattenCategoryTree(node.children || [], depth + 1, [
                ...parentNames,
                node.name,
            ]),
        ];
    });
};

export const formatCategoryLabel = (category, depth = 0) => {
    const prefix = depth > 0 ? `${"\u00A0".repeat(depth * 2)}└ ` : "";
    return `${prefix}${category.name}`;
};

export const getCategoryPath = (category) => {
    if (!category) return "";

    const names = [];
    let current = category;
    while (current) {
        if (current.name) {
            names.unshift(current.name);
        }
        current = current.parentCategory || null;
    }

    return names.join(" / ");
};

export const buildCategoryBreadcrumbs = (category, currentItemName) => {
    const breadcrumbs = [];
    let current = category;

    while (current) {
        if (current.name) {
            breadcrumbs.unshift({
                label: current.name,
                path: `/catalog?categoryId=${current.id}`,
            });
        }
        current = current.parentCategory || null;
    }

    if (currentItemName) {
        breadcrumbs.push({ label: currentItemName });
    }

    return breadcrumbs;
};
